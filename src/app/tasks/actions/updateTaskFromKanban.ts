'use server';

import { connectDB } from '@/db/connect';
import sql from 'mssql';
import { logTaskHistory } from './taskHistory';
import { query } from '@/db/connect';

interface UpdateTaskFromKanbanInput {
  id: number;
  taskName: string;
  description?: string;
  statusId: number;
  priorityId?: number;
  executorId?: number;
  typeId?: number;
  startDate?: string;
  dedline?: string;
}

interface UpdateTaskFromKanbanResult {
  success: boolean;
  error?: string;
}

export async function updateTaskFromKanban(data: UpdateTaskFromKanbanInput): Promise<UpdateTaskFromKanbanResult> {
  try {
    // Получаем старые значения для сравнения
    const oldTask = await query(`
      SELECT 
        t.taskName,
        t.description,
        t.statusId,
        t.priorityId,
        t.executorId,
        t.typeId,
        t.startDate,
        t.dedline,
        st.status as statusName,
        p.priority as priorityName,
        e.Name as executorName,
        tt.typeName as typeName
      FROM Task t
      LEFT JOIN StatusTask st ON t.statusId = st.id
      LEFT JOIN Priority p ON t.priorityId = p.id
      LEFT JOIN Employee e ON t.executorId = e.id
      LEFT JOIN TaskTypes tt ON t.typeId = tt.id
      WHERE t.id = @id
    `, { id: data.id });

    const oldTaskData = oldTask[0];
    
    const pool = await connectDB();
    
    // Преобразуем дату начала
    let startDateParsed = null;
    if (data.startDate) {
      try {
        startDateParsed = new Date(data.startDate);
        // Проверяем корректность даты
        if (isNaN(startDateParsed.getTime())) {
          startDateParsed = null;
        }
      } catch (e) {
        console.error('Invalid startDate:', e);
        startDateParsed = null;
      }
    }
    
    // Преобразуем дату дедлайна
    let dedlineDate = null;
    if (data.dedline) {
      try {
        dedlineDate = new Date(data.dedline);
        // Проверяем корректность даты
        if (isNaN(dedlineDate.getTime())) {
          dedlineDate = null;
        }
      } catch (e) {
        console.error('Invalid dedline date:', e);
        dedlineDate = null;
      }
    }

    await pool
      .request()
      .input('id', sql.Int, data.id)
      .input('taskName', sql.NVarChar, data.taskName)
      .input('description', sql.NVarChar, data.description || null)
      .input('statusId', sql.Int, data.statusId)
      .input('priorityId', sql.Int, data.priorityId || null)
      .input('executorId', sql.Int, data.executorId || null)
      .input('typeId', sql.Int, data.typeId || null)
      .input('startDate', sql.DateTime, startDateParsed)
      .input('dedline', sql.DateTime, dedlineDate)
      .query(`
        UPDATE Task 
        SET 
          taskName = @taskName,
          description = @description,
          statusId = @statusId,
          priorityId = @priorityId,
          executorId = @executorId,
          typeId = @typeId,
          startDate = @startDate,
          dedline = @dedline,
          dtu = GETDATE()
        WHERE id = @id
      `);

    // Получаем новые значения с именами для истории
    const newTask = await query(`
      SELECT 
        t.taskName,
        t.description,
        t.statusId,
        t.priorityId,
        t.executorId,
        t.typeId,
        t.startDate,
        t.dedline,
        st.status as statusName,
        p.priority as priorityName,
        e.Name as executorName,
        tt.typeName as typeName
      FROM Task t
      LEFT JOIN StatusTask st ON t.statusId = st.id
      LEFT JOIN Priority p ON t.priorityId = p.id
      LEFT JOIN Employee e ON t.executorId = e.id
      LEFT JOIN TaskTypes tt ON t.typeId = tt.id
      WHERE t.id = @id
    `, { id: data.id });

    const newTaskData = newTask[0];

    // Логируем изменения
    if (oldTaskData) {
      // Изменение названия
      if (oldTaskData.taskName !== newTaskData.taskName) {
        await logTaskHistory(data.id, {
          actionType: 'name_changed',
          fieldName: 'taskName',
          oldValue: oldTaskData.taskName,
          newValue: newTaskData.taskName
        });
      }

      // Изменение описания
      if ((oldTaskData.description || '') !== (newTaskData.description || '')) {
        await logTaskHistory(data.id, {
          actionType: 'description_changed',
          fieldName: 'description'
        });
      }

      // Изменение статуса
      if (oldTaskData.statusId !== newTaskData.statusId) {
        await logTaskHistory(data.id, {
          actionType: 'status_changed',
          fieldName: 'status',
          oldValue: oldTaskData.statusName,
          newValue: newTaskData.statusName
        });
      }

      // Изменение приоритета
      if (oldTaskData.priorityId !== newTaskData.priorityId) {
        await logTaskHistory(data.id, {
          actionType: 'priority_changed',
          fieldName: 'priority',
          oldValue: oldTaskData.priorityName || 'Не указан',
          newValue: newTaskData.priorityName || 'Не указан'
        });
      }

      // Изменение исполнителя
      if (oldTaskData.executorId !== newTaskData.executorId) {
        await logTaskHistory(data.id, {
          actionType: 'executor_changed',
          fieldName: 'executor',
          oldValue: oldTaskData.executorName || 'Не назначен',
          newValue: newTaskData.executorName || 'Не назначен'
        });
      }

      // Изменение типа задачи
      if (oldTaskData.typeId !== newTaskData.typeId) {
        await logTaskHistory(data.id, {
          actionType: 'type_changed',
          fieldName: 'type',
          oldValue: oldTaskData.typeName || 'Не указан',
          newValue: newTaskData.typeName || 'Не указан'
        });
      }

      // Изменение даты начала
      const oldStartDate = oldTaskData.startDate ? 
        new Date(oldTaskData.startDate).toLocaleString('ru-RU', {
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : null;
      const newStartDate = newTaskData.startDate ? 
        new Date(newTaskData.startDate).toLocaleString('ru-RU', {
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : null;
      if (oldStartDate !== newStartDate) {
        await logTaskHistory(data.id, {
          actionType: 'startdate_changed',
          fieldName: 'startDate',
          oldValue: oldStartDate,
          newValue: newStartDate
        });
      }

      // Изменение дедлайна
      const oldDedline = oldTaskData.dedline ? 
        new Date(oldTaskData.dedline).toLocaleString('ru-RU', {
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : null;
      const newDedline = newTaskData.dedline ? 
        new Date(newTaskData.dedline).toLocaleString('ru-RU', {
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : null;
      if (oldDedline !== newDedline) {
        await logTaskHistory(data.id, {
          actionType: 'deadline_changed',
          fieldName: 'dedline',
          oldValue: oldDedline,
          newValue: newDedline
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error('updateTaskFromKanban error:', error);
    return { success: false, error: 'Ошибка при обновлении задачи' };
  }
}
