'use server';

import { getCurrentUser } from '@/app/(auth)/actions/login';
import { query } from '@/db/connect';
import type { TaskHistoryItem } from '../../inbox/actions/getTasksHistory';

export async function getProjectHistory(projectId: number, limit = 200): Promise<TaskHistoryItem[]> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return [];

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
        u.nicName as userName,
        u.nicName as userFullName,
        u.id as actorUserId,
        t.taskName,
        t.description as taskDescription,
        t.statusId,
        st.status as statusName,
        t.executorId,
        e.userId as executorUserId,
        e.Name as executorName,
        t.priorityId,
        p.priority as priorityName,
        proj.projectName,
        t.dtc as createdAt
      FROM TaskHistory th
      INNER JOIN Task t ON th.taskId = t.id
      LEFT JOIN [Users] u ON th.userId = u.id
      LEFT JOIN StatusTask st ON t.statusId = st.id
      LEFT JOIN Employee e ON t.executorId = e.id
      LEFT JOIN Priority p ON t.priorityId = p.id
      LEFT JOIN Project proj ON t.projectId = proj.id
      WHERE t.projectId = @projectId
      ORDER BY th.dtc DESC
    `, { projectId, limit });

    return result || [];
  } catch (error) {
    console.error('Ошибка получения истории проекта:', error);
    return [];
  }
}
