'use server';

import { query } from '@/db/connect';

export interface TaskHistoryItem {
  id: number;
  taskId: number;
  actionType: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  description: string;
  dtc: string;
  userName?: string;
  userFullName?: string;
  actorUserId: number;
  taskName: string;
  taskDescription?: string;
  statusId: number;
  statusName: string;
  executorId?: number;
  executorName?: string;
  priorityId?: number;
  priorityName?: string;
  projectName?: string;
  createdAt?: string;
  isViewed?: boolean;
}

export interface TaskStats {
  taskId: number;
  createdAt: string;
  totalDays: number;
  statusStats: Array<{
    statusName: string;
    daysInStatus: number;
    percentage: number;
  }>;
  longestStatus: {
    statusName: string;
    days: number;
  };
}

/**
 * Получает объединённую историю по всем задачам для входящих
 */
export async function getTasksHistory(limit: number = 50): Promise<TaskHistoryItem[]> {
  try {
    const result = await query(`
      SELECT TOP (@limit)
        th.id,
        th.taskId,
        th.actionType,
        th.fieldName,
        th.oldValue,
        th.newValue,
        th.description,
        th.dtc,
        th.isViewed,
        u.nicName as userName,
        u.nicName as userFullName,
        u.id as actorUserId,
        t.taskName,
        t.description as taskDescription,
        t.statusId,
        st.status as statusName,
        t.executorId,
        e.Name as executorName,
        t.priorityId,
        p.priority as priorityName,
        proj.projectName,
        t.dtc as createdAt
      FROM TaskHistory th
      LEFT JOIN [Users] u ON th.userId = u.id
      LEFT JOIN Task t ON th.taskId = t.id
      LEFT JOIN StatusTask st ON t.statusId = st.id
      LEFT JOIN Employee e ON t.executorId = e.id
      LEFT JOIN Priority p ON t.priorityId = p.id
      LEFT JOIN Project proj ON t.projectId = proj.id
      WHERE t.id IS NOT NULL
        AND (th.isViewed = 0 OR th.isViewed IS NULL)
      ORDER BY th.dtc DESC
    `, { limit });

    return result || [];
  } catch (error) {
    console.error('Ошибка получения истории задач для входящих:', error);
    return [];
  }
}

/**
 * Получает статистику по задаче на основе истории
 */
export async function getTaskStats(taskId: number): Promise<TaskStats | null> {
  try {
    // Получаем все изменения статуса для задачи
    const statusChanges = await query(`
      SELECT 
        th.dtc,
        th.newValue as statusName,
        th.actionType
      FROM TaskHistory th
      WHERE th.taskId = @taskId 
        AND (th.actionType = 'status_changed' OR th.actionType = 'created')
      ORDER BY th.dtc ASC
    `, { taskId });

    // Получаем дату создания задачи
    const taskInfo = await query(`
      SELECT dtc as createdAt, statusId
      FROM Task
      WHERE id = @taskId
    `, { taskId });

    if (!taskInfo || taskInfo.length === 0) {
      return null;
    }

    const createdAt = new Date(taskInfo[0].createdAt);
    const now = new Date();
    const totalMs = now.getTime() - createdAt.getTime();
    const totalDays = Math.floor(totalMs / (1000 * 60 * 60 * 24));

    // Подсчитываем время в каждом статусе
    const statusTimeMap: { [key: string]: number } = {};
    
    if (statusChanges && statusChanges.length > 0) {
      for (let i = 0; i < statusChanges.length; i++) {
        const current = statusChanges[i];
        const statusName = current.statusName || 'Новая';
        const startTime = new Date(current.dtc);
        const endTime = i < statusChanges.length - 1 
          ? new Date(statusChanges[i + 1].dtc)
          : now;
        
        const daysInStatus = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24));
        
        if (statusTimeMap[statusName]) {
          statusTimeMap[statusName] += daysInStatus;
        } else {
          statusTimeMap[statusName] = daysInStatus;
        }
      }
    }

    // Преобразуем в массив статистики
    const statusStats = Object.entries(statusTimeMap).map(([statusName, days]) => ({
      statusName,
      daysInStatus: days,
      percentage: totalDays > 0 ? Math.round((days / totalDays) * 100) : 0
    })).sort((a, b) => b.daysInStatus - a.daysInStatus);

    // Находим статус, где провели больше всего времени
    const longestStatus = statusStats.length > 0 
      ? { statusName: statusStats[0].statusName, days: statusStats[0].daysInStatus }
      : { statusName: 'Неизвестно', days: 0 };

    return {
      taskId,
      createdAt: createdAt.toISOString(),
      totalDays,
      statusStats,
      longestStatus
    };
  } catch (error) {
    console.error('Ошибка получения статистики задачи:', error);
    return null;
  }
}

/**
 * Получает упрощенную статистику для задач из списка истории
 */
export async function getTasksStatsMap(taskIds: number[]): Promise<Map<number, { daysFromCreation: number; currentStatus: string }>> {
  if (taskIds.length === 0) return new Map();

  try {
    const stats = await query(`
      SELECT 
        t.id as taskId,
        t.dtc as createdAt,
        st.status as currentStatus
      FROM Task t
      LEFT JOIN StatusTask st ON t.statusId = st.id
      WHERE t.id IN (${taskIds.join(',')})
    `);

    const statsMap = new Map<number, { daysFromCreation: number; currentStatus: string }>();
    const now = new Date();

    for (const row of stats) {
      const createdAt = new Date(row.createdAt);
      const totalMs = now.getTime() - createdAt.getTime();
      const daysFromCreation = Math.floor(totalMs / (1000 * 60 * 60 * 24));

      statsMap.set(row.taskId, {
        daysFromCreation,
        currentStatus: row.currentStatus || 'Неизвестно'
      });
    }

    return statsMap;
  } catch (error) {
    console.error('Ошибка получения статистики задач:', error);
    return new Map();
  }
}

/**
 * Отмечает запись истории как прочитанную
 */
export async function markHistoryAsViewed(historyId: number) {
  try {
    await query(`
      UPDATE TaskHistory
      SET isViewed = 1
      WHERE id = @historyId
    `, { historyId });

    return { success: true };
  } catch (error) {
    console.error('Ошибка отметки истории как прочитанной:', error);
    return { success: false };
  }
}

/**
 * Отмечает все записи истории как прочитанные
 */
export async function markAllHistoryAsViewed() {
  try {
    await query(`
      UPDATE TaskHistory
      SET isViewed = 1
      WHERE isViewed = 0 OR isViewed IS NULL
    `);

    return { success: true };
  } catch (error) {
    console.error('Ошибка отметки всей истории как прочитанной:', error);
    return { success: false };
  }
}

/**
 * Получает количество непрочитанных записей истории
 */
export async function getUnreadHistoryCount(): Promise<number> {
  try {
    const result = await query(`
      SELECT COUNT(*) as count
      FROM TaskHistory
      WHERE isViewed = 0 OR isViewed IS NULL
    `);

    return result && result[0] ? result[0].count : 0;
  } catch (error) {
    console.error('Ошибка получения количества непрочитанных записей:', error);
    return 0;
  }
}
