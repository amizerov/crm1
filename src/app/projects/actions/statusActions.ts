'use server';

import { query } from '@/db/connect';
import { revalidatePath } from 'next/cache';

export interface StatusTask {
  id: number;
  projectId: number | null;
  stepOrder: number;
  status: string;
  statusEng: string;
  description?: string;
}

// Получить статусы по умолчанию (без проекта)
export async function getDefaultStatuses(): Promise<StatusTask[]> {
  try {
    const result = await query(
      `SELECT id, projectId, stepOrder, status, statusEng, description
       FROM StatusTask
       WHERE projectId IS NULL
       ORDER BY stepOrder`
    );
    return result as StatusTask[];
  } catch (error) {
    console.error('getDefaultStatuses error:', error);
    return [];
  }
}

// Получить статусы конкретного проекта
export async function getProjectStatuses(projectId: number): Promise<StatusTask[]> {
  try {
    const result = await query(
      `SELECT id, projectId, stepOrder, status, statusEng, description
       FROM StatusTask
       WHERE projectId = @projectId
       ORDER BY stepOrder`,
      { projectId }
    );
    return result as StatusTask[];
  } catch (error) {
    console.error('getProjectStatuses error:', error);
    return [];
  }
}

// Создать статусы для проекта из шаблона
export async function createProjectStatusesFromTemplate(projectId: number, templateId: number) {
  try {
    // Получаем процессы из шаблона
    const processes = await query(
      `SELECT stepName, stepOrder, description
       FROM Process
       WHERE templateId = @templateId
       ORDER BY stepOrder`,
      { templateId }
    ) as { stepName: string; stepOrder: number; description?: string }[];

    // Создаём статусы для проекта
    for (const process of processes) {
      await query(
        `INSERT INTO StatusTask (projectId, stepOrder, status, statusEng, description)
         VALUES (@projectId, @stepOrder, @status, @statusEng, @description)`,
        {
          projectId,
          stepOrder: process.stepOrder,
          status: process.stepName,
          statusEng: process.stepName.replace(/\s+/g, '_'),
          description: process.description || null
        }
      );
    }

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error('createProjectStatusesFromTemplate error:', error);
    return { success: false, error: 'Ошибка при создании статусов из шаблона' };
  }
}

// Создать статусы для проекта из статусов по умолчанию
export async function createProjectStatusesFromDefault(projectId: number) {
  try {
    // Копируем статусы по умолчанию
    await query(
      `INSERT INTO StatusTask (projectId, stepOrder, status, statusEng, description)
       SELECT @projectId, stepOrder, status, statusEng, description
       FROM StatusTask
       WHERE projectId IS NULL
       ORDER BY stepOrder`,
      { projectId }
    );

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error('createProjectStatusesFromDefault error:', error);
    return { success: false, error: 'Ошибка при создании статусов по умолчанию' };
  }
}

// Создать новый статус для проекта
export async function createProjectStatus(input: {
  projectId: number;
  status: string;
  stepOrder: number;
  description?: string;
}) {
  try {
    const { projectId, status, stepOrder, description } = input;

    if (!status?.trim()) {
      return { success: false, error: 'Название статуса обязательно' };
    }

    const result = await query(
      `INSERT INTO StatusTask (projectId, stepOrder, status, statusEng, description)
       OUTPUT INSERTED.id
       VALUES (@projectId, @stepOrder, @status, @statusEng, @description)`,
      {
        projectId,
        stepOrder,
        status: status.trim(),
        statusEng: status.trim().replace(/\s+/g, '_'),
        description: description?.trim() || null
      }
    );

    const resultArray = result as any[];
    revalidatePath(`/projects/${projectId}`);
    return { success: true, statusId: resultArray[0]?.id };
  } catch (error) {
    console.error('createProjectStatus error:', error);
    return { success: false, error: 'Ошибка при создании статуса' };
  }
}

// Обновить статус проекта
export async function updateProjectStatus(input: {
  id: number;
  status: string;
  stepOrder: number;
  description?: string;
  projectId: number;
}) {
  try {
    const { id, status, stepOrder, description, projectId } = input;

    if (!status?.trim()) {
      return { success: false, error: 'Название статуса обязательно' };
    }

    await query(
      `UPDATE StatusTask
       SET status = @status, 
           statusEng = @statusEng,
           stepOrder = @stepOrder, 
           description = @description
       WHERE id = @id AND projectId = @projectId`,
      {
        id,
        status: status.trim(),
        statusEng: status.trim().replace(/\s+/g, '_'),
        stepOrder,
        description: description?.trim() || null,
        projectId
      }
    );

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error('updateProjectStatus error:', error);
    return { success: false, error: 'Ошибка при обновлении статуса' };
  }
}

// Удалить статус проекта
export async function deleteProjectStatus(id: number, projectId: number) {
  try {
    // Проверяем, используется ли этот статус в задачах
    const tasksWithStatus = await query(
      `SELECT COUNT(*) as count FROM Task WHERE statusId = @id`,
      { id }
    ) as { count: number }[];

    if (tasksWithStatus[0]?.count > 0) {
      return { 
        success: false, 
        error: `Невозможно удалить статус, так как он используется в ${tasksWithStatus[0].count} задачах` 
      };
    }

    await query(
      `DELETE FROM StatusTask WHERE id = @id AND projectId = @projectId`,
      { id, projectId }
    );

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error('deleteProjectStatus error:', error);
    return { success: false, error: 'Ошибка при удалении статуса' };
  }
}

// Изменить порядок статусов проекта
export async function reorderProjectStatuses(projectId: number, statusIds: number[]) {
  try {
    for (let i = 0; i < statusIds.length; i++) {
      await query(
        `UPDATE StatusTask 
         SET stepOrder = @stepOrder
         WHERE id = @statusId AND projectId = @projectId`,
        {
          statusId: statusIds[i],
          stepOrder: i + 1,
          projectId
        }
      );
    }

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error('reorderProjectStatuses error:', error);
    return { success: false, error: 'Ошибка при изменении порядка статусов' };
  }
}
