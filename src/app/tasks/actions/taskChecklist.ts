'use server';

import { query } from '@/db/connect';
import { revalidatePath } from 'next/cache';

export interface ChecklistItem {
  id: number;
  taskId: number;
  description: string;
  isCompleted: boolean;
  orderInList: number;
  userId: number | null;
  userName?: string;
  dtc: string;
  dtu: string | null;
}

/**
 * Получить все пункты чеклиста для задачи
 */
export async function getTaskChecklist(taskId: number): Promise<ChecklistItem[]> {
  try {
    const result = await query(`
      SELECT 
        tc.id,
        tc.taskId,
        tc.description,
        tc.isCompleted,
        tc.orderInList,
        tc.userId,
        tc.dtc,
        tc.dtu,
        u.nicName as userName
      FROM TaskChecklist tc
      LEFT JOIN Users u ON tc.userId = u.id
      WHERE tc.taskId = @taskId
      ORDER BY tc.orderInList ASC, tc.id ASC
    `, { taskId });

    return result.map((row: any) => ({
      id: row.id,
      taskId: row.taskId,
      description: row.description,
      isCompleted: Boolean(row.isCompleted),
      orderInList: row.orderInList,
      userId: row.userId,
      userName: row.userName,
      dtc: row.dtc?.toISOString() || new Date().toISOString(),
      dtu: row.dtu?.toISOString() || null,
    }));
  } catch (error) {
    console.error('Error fetching checklist:', error);
    throw new Error('Не удалось загрузить чеклист');
  }
}

/**
 * Добавить новый пункт чеклиста
 */
export async function addChecklistItem(
  taskId: number,
  description: string,
  userId: number
): Promise<void> {
  try {
    // Получаем максимальный orderInList для этой задачи
    const maxOrderResult = await query(`
      SELECT ISNULL(MAX(orderInList), -1) as maxOrder
      FROM TaskChecklist
      WHERE taskId = @taskId
    `, { taskId });

    const newOrder = (maxOrderResult[0]?.maxOrder ?? -1) + 1;

    await query(`
      INSERT INTO TaskChecklist (taskId, description, isCompleted, orderInList, userId, dtc)
      VALUES (@taskId, @description, 0, @orderInList, @userId, GETDATE())
    `, {
      taskId,
      description: description.trim(),
      orderInList: newOrder,
      userId,
    });

    revalidatePath('/tasks/views');
  } catch (error) {
    console.error('Error adding checklist item:', error);
    throw new Error('Не удалось добавить пункт чеклиста');
  }
}

/**
 * Обновить текст пункта чеклиста
 */
export async function updateChecklistItem(
  itemId: number,
  description: string
): Promise<void> {
  try {
    await query(`
      UPDATE TaskChecklist
      SET description = @description, dtu = GETDATE()
      WHERE id = @itemId
    `, {
      itemId,
      description: description.trim(),
    });

    revalidatePath('/tasks/views');
  } catch (error) {
    console.error('Error updating checklist item:', error);
    throw new Error('Не удалось обновить пункт чеклиста');
  }
}

/**
 * Переключить статус выполнения пункта чеклиста
 */
export async function toggleChecklistItem(
  itemId: number,
  isCompleted: boolean
): Promise<void> {
  try {
    await query(`
      UPDATE TaskChecklist
      SET isCompleted = @isCompleted, dtu = GETDATE()
      WHERE id = @itemId
    `, {
      itemId,
      isCompleted: isCompleted ? 1 : 0,
    });

    revalidatePath('/tasks/views');
  } catch (error) {
    console.error('Error toggling checklist item:', error);
    throw new Error('Не удалось изменить статус пункта');
  }
}

/**
 * Удалить пункт чеклиста
 */
export async function deleteChecklistItem(itemId: number): Promise<void> {
  try {
    // Получаем taskId и orderInList удаляемого пункта
    const itemResult = await query(`
      SELECT taskId, orderInList
      FROM TaskChecklist
      WHERE id = @itemId
    `, { itemId });

    if (itemResult.length === 0) {
      throw new Error('Пункт чеклиста не найден');
    }

    const { taskId, orderInList } = itemResult[0];

    // Удаляем пункт
    await query(`
      DELETE FROM TaskChecklist
      WHERE id = @itemId
    `, { itemId });

    // Перенумеровываем оставшиеся пункты
    await query(`
      UPDATE TaskChecklist
      SET orderInList = orderInList - 1
      WHERE taskId = @taskId AND orderInList > @orderInList
    `, { taskId, orderInList });

    revalidatePath('/tasks/views');
  } catch (error) {
    console.error('Error deleting checklist item:', error);
    throw new Error('Не удалось удалить пункт чеклиста');
  }
}

/**
 * Изменить порядок пунктов чеклиста
 */
export async function reorderChecklistItems(
  taskId: number,
  itemId: number,
  newOrder: number
): Promise<void> {
  try {
    // Получаем текущий порядок
    const currentResult = await query(`
      SELECT orderInList
      FROM TaskChecklist
      WHERE id = @itemId
    `, { itemId });

    if (currentResult.length === 0) {
      throw new Error('Пункт чеклиста не найден');
    }

    const oldOrder = currentResult[0].orderInList;

    if (oldOrder === newOrder) return;

    // Сдвигаем пункты между старой и новой позицией
    if (oldOrder < newOrder) {
      // Перемещение вниз: сдвигаем вверх пункты между старой и новой позицией
      await query(`
        UPDATE TaskChecklist
        SET orderInList = orderInList - 1
        WHERE taskId = @taskId 
          AND orderInList > @oldOrder 
          AND orderInList <= @newOrder
      `, { taskId, oldOrder, newOrder });
    } else {
      // Перемещение вверх: сдвигаем вниз пункты между новой и старой позицией
      await query(`
        UPDATE TaskChecklist
        SET orderInList = orderInList + 1
        WHERE taskId = @taskId 
          AND orderInList >= @newOrder 
          AND orderInList < @oldOrder
      `, { taskId, oldOrder, newOrder });
    }

    // Устанавливаем новый порядок для перемещаемого пункта
    await query(`
      UPDATE TaskChecklist
      SET orderInList = @newOrder, dtu = GETDATE()
      WHERE id = @itemId
    `, { itemId, newOrder });

    revalidatePath('/tasks/views');
  } catch (error) {
    console.error('Error reordering checklist items:', error);
    throw new Error('Не удалось изменить порядок пунктов');
  }
}
