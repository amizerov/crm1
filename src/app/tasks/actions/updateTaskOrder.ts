'use server';

import { getCurrentUser } from '@/app/(auth)/actions/login';
import { query } from '@/db/connect';
import { logTaskHistory } from './taskHistory';

export async function updateTaskOrder(taskId: number, newStatusId: number, newOrder: number) {
  try {
    console.log('🔧 updateTaskOrder START:', { taskId, newStatusId, newOrder });
    
    // Получаем текущего пользователя для проверки авторизации
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error('Пользователь не авторизован');
    }

    // 1. Получаем текущую задачу
    const currentTaskResult = await query(
      'SELECT statusId, orderInStatus FROM Task WHERE id = @taskId',
      { taskId }
    );

    if (!currentTaskResult || currentTaskResult.length === 0) {
      throw new Error('Задача не найдена');
    }

    const oldStatusId = currentTaskResult[0].statusId;
    const oldOrder = currentTaskResult[0].orderInStatus || 0;
    
    console.log('📊 Current task state:', { oldStatusId, oldOrder, newStatusId, newOrder });

    // 2. Если статус изменился (перемещение между колонками)
    if (oldStatusId !== newStatusId) {
      console.log('🔄 Moving between columns');
      
      // Получаем названия статусов для истории
      const oldStatusResult = await query('SELECT status FROM StatusTask WHERE id = @id', { id: oldStatusId });
      const newStatusResult = await query('SELECT status FROM StatusTask WHERE id = @id', { id: newStatusId });
      const oldStatusName = oldStatusResult[0]?.status || `Статус ${oldStatusId}`;
      const newStatusName = newStatusResult[0]?.status || `Статус ${newStatusId}`;
      
      // 2.1. Сдвигаем задачи в новой колонке (освобождаем место)
      console.log('📍 Shifting tasks in NEW column down from position', newOrder);
      await query(`
        UPDATE Task 
        SET orderInStatus = orderInStatus + 1,
            dtu = GETDATE()
        WHERE statusId = @newStatusId 
        AND orderInStatus >= @newOrder
      `, { newStatusId, newOrder });

      // 2.2. Перемещаем задачу
      console.log('💾 Moving task to new column');
      await query(`
        UPDATE Task 
        SET statusId = @newStatusId,
            orderInStatus = @newOrder,
            dtu = GETDATE()
        WHERE id = @taskId
      `, { taskId, newStatusId, newOrder });

      // 2.3. ВАЖНО: Перенумеровываем задачи в старой колонке (убираем пропуск)
      console.log('📝 Renumbering old column:', oldStatusId);
      await query(`
        UPDATE Task 
        SET orderInStatus = orderInStatus - 1,
            dtu = GETDATE()
        WHERE statusId = @oldStatusId 
        AND orderInStatus > @oldOrder
      `, { oldStatusId, oldOrder });

      // 2.4. Записываем в историю
      await logTaskHistory(taskId, {
        actionType: 'order_changed',
        fieldName: 'status_and_order',
        oldValue: oldStatusName,
        newValue: newStatusName,
        description: `переместил(а) задачу из "${oldStatusName}" в "${newStatusName}"`
      });

    } else {
      // 3. Перемещение внутри одной колонки
      console.log('↔️ Moving within same column');
      
      if (oldOrder === newOrder) {
        console.log('✅ Same position, no changes needed');
        return { success: true };
      }

      if (oldOrder < newOrder) {
        // Перемещаем вниз
        console.log('⬇️ Moving down');
        await query(`
          UPDATE Task 
          SET orderInStatus = orderInStatus - 1,
              dtu = GETDATE()
          WHERE statusId = @statusId 
          AND orderInStatus > @oldOrder 
          AND orderInStatus <= @newOrder
        `, { statusId: newStatusId, oldOrder, newOrder });
      } else {
        // Перемещаем вверх
        console.log('⬆️ Moving up');
        await query(`
          UPDATE Task 
          SET orderInStatus = orderInStatus + 1,
              dtu = GETDATE()
          WHERE statusId = @statusId 
          AND orderInStatus >= @newOrder 
          AND orderInStatus < @oldOrder
        `, { statusId: newStatusId, oldOrder, newOrder });
      }

      // Обновляем саму задачу
      console.log('💾 Updating task position');
      await query(`
        UPDATE Task 
        SET orderInStatus = @newOrder,
            dtu = GETDATE()
        WHERE id = @taskId
      `, { taskId, newOrder });

      // Записываем в историю
      const statusResult = await query('SELECT status FROM StatusTask WHERE id = @id', { id: newStatusId });
      const statusName = statusResult[0]?.status || `Статус ${newStatusId}`;
      
      await logTaskHistory(taskId, {
        actionType: 'order_changed',
        fieldName: 'order_in_status',
        oldValue: `позиция ${oldOrder + 1}`,
        newValue: `позиция ${newOrder + 1}`,
        description: `изменил(а) порядок задачи в "${statusName}" с позиции ${oldOrder + 1} на позицию ${newOrder + 1}`
      });
    }

    // 4. ФИНАЛЬНАЯ ПРОВЕРКА: убедимся, что нумерация сквозная без пропусков
    console.log('� Verifying numbering integrity');
    
    // Получаем все статусы, которые были затронуты
    const statusesToCheck = oldStatusId !== newStatusId 
      ? [oldStatusId, newStatusId] 
      : [newStatusId];

    for (const statusId of statusesToCheck) {
      console.log(`  📊 Checking status ${statusId}`);
      
      // Получаем все задачи статуса, отсортированные по текущему orderInStatus
      const tasksInStatus = await query(`
        SELECT id, orderInStatus 
        FROM Task 
        WHERE statusId = @statusId 
        AND parentId IS NULL
        ORDER BY COALESCE(orderInStatus, 999999), id
      `, { statusId });

      // Перенумеровываем, чтобы была сквозная нумерация 0, 1, 2, 3...
      for (let i = 0; i < tasksInStatus.length; i++) {
        const task = tasksInStatus[i];
        if (task.orderInStatus !== i) {
          await query(`
            UPDATE Task 
            SET orderInStatus = @newOrder 
            WHERE id = @taskId
          `, { taskId: task.id, newOrder: i });
          console.log(`  ✏️ Renumbered task ${task.id}: ${task.orderInStatus} -> ${i}`);
        }
      }
    }

    console.log('✅ updateTaskOrder completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Ошибка обновления порядка задачи:', error);
    return { error: 'Не удалось обновить порядок задачи' };
  }
}