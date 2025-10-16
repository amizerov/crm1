'use server';

import { query } from '@/db/connect';
import { Task } from '@/app/tasks/types';

/**
 * Получить входящие задачи для текущего пользователя
 * - Новые задачи (недавно назначенные)
 * - Задачи с изменениями
 * - Просроченные задачи
 */
export async function getInboxTasks(userId: number): Promise<Task[]> {
  try {
    
    const sql = `
      SELECT 
        t.*,
        p.name as projectName,
        e.fullName as executorName,
        c.fullName as creatorName,
        tt.name as taskTypeName,
        tt.color as taskTypeColor
      FROM tasks t
      LEFT JOIN projects p ON t.projectId = p.id
      LEFT JOIN employees e ON t.executor = e.id
      LEFT JOIN employees c ON t.creator = c.id
      LEFT JOIN taskTypes tt ON t.taskTypeId = tt.id
      WHERE t.executor = @userId
        AND (
          -- Новые задачи (созданы за последние 7 дней)
          DATEDIFF(day, t.createdAt, GETDATE()) <= 7
          -- Или задачи со статусом "новая" (предполагаем статус 1 = новая)
          OR t.statusId IN (
            SELECT id FROM statuses WHERE lower(name) LIKE '%нов%' OR lower(name) LIKE '%to do%'
          )
          -- Или просроченные задачи
          OR (t.deadline IS NOT NULL AND t.deadline < GETDATE() AND t.statusId NOT IN (
            SELECT id FROM statuses WHERE lower(name) LIKE '%выполнен%' OR lower(name) LIKE '%done%'
          ))
        )
      ORDER BY 
        CASE 
          WHEN t.deadline IS NOT NULL AND t.deadline < GETDATE() THEN 1
          ELSE 2
        END,
        t.createdAt DESC
    `;

    const result = await query(sql, {
      userId
    });

    return result as Task[];
  } catch (error) {
    console.error('Ошибка при получении входящих задач:', error);
    return [];
  }
}

/**
 * Отметить задачу как "просмотренную" во входящих
 */
export async function markTaskAsViewed(taskId: number, userId: number): Promise<void> {
  try {
    // В будущем можно добавить таблицу для отслеживания просмотренных уведомлений
    // Пока просто логируем
    console.log(`Задача ${taskId} просмотрена пользователем ${userId}`);
  } catch (error) {
    console.error('Ошибка при отметке задачи:', error);
  }
}
