'use server';

import { query } from '@/db/connect';
import { revalidatePath } from 'next/cache';

export interface TaskType {
  id: number;
  projectId: number;
  typeName: string;
  typeOrder: number;
  typeColor: string | null;
}

export async function getProjectTaskTypes(projectId: number): Promise<TaskType[]> {
  try {
    const result = await query(
      `SELECT id, projectId, typeName, typeOrder, typeColor
       FROM TaskTypes
       WHERE projectId = @projectId
       ORDER BY typeOrder ASC`,
      { projectId }
    );
    
    return result.map((row: any) => ({
      id: row.id as number,
      projectId: row.projectId as number,
      typeName: row.typeName as string,
      typeOrder: row.typeOrder as number,
      typeColor: row.typeColor as string | null
    }));
  } catch (error) {
    console.error('Ошибка при получении типов задач:', error);
    return [];
  }
}

export async function createTaskType(data: {
  projectId: number;
  typeName: string;
  typeOrder: number;
  typeColor?: string;
}): Promise<{ success: boolean; taskTypeId?: number; error?: string }> {
  try {
    const result = await query(
      `INSERT INTO TaskTypes (projectId, typeName, typeOrder, typeColor)
       OUTPUT INSERTED.id
       VALUES (@projectId, @typeName, @typeOrder, @typeColor)`,
      {
        projectId: data.projectId,
        typeName: data.typeName,
        typeOrder: data.typeOrder,
        typeColor: data.typeColor || null
      }
    );

    return {
      success: true,
      taskTypeId: result[0]?.id
    };
  } catch (error: any) {
    console.error('Ошибка при создании типа задач:', error);
    return {
      success: false,
      error: error.message || 'Неизвестная ошибка'
    };
  } finally {
    revalidatePath(`/projects/edit/${data.projectId}`);
  }
}

export async function updateTaskType(data: {
  id: number;
  typeName: string;
  typeColor?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await query(
      `UPDATE TaskTypes
       SET typeName = @typeName, typeColor = @typeColor
       WHERE id = @id`,
      {
        id: data.id,
        typeName: data.typeName,
        typeColor: data.typeColor || null
      }
    );

    // Получаем projectId для revalidatePath
    const projectResult = await query(
      `SELECT projectId FROM TaskTypes WHERE id = @id`,
      { id: data.id }
    );
    
    if (projectResult.length > 0) {
      revalidatePath(`/projects/edit/${projectResult[0].projectId}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Ошибка при обновлении типа задач:', error);
    return {
      success: false,
      error: error.message || 'Неизвестная ошибка'
    };
  }
}

export async function deleteTaskType(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    // Получаем projectId перед удалением
    const projectResult = await query(
      `SELECT projectId FROM TaskTypes WHERE id = @id`,
      { id }
    );
    
    await query(`DELETE FROM TaskTypes WHERE id = @id`, { id });
    
    if (projectResult.length > 0) {
      revalidatePath(`/projects/edit/${projectResult[0].projectId}`);
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Ошибка при удалении типа задач:', error);
    return {
      success: false,
      error: error.message || 'Неизвестная ошибка'
    };
  }
}

export async function reorderTaskTypes(updates: { id: number; typeOrder: number }[]): Promise<{ success: boolean; error?: string }> {
  try {
    let projectId: number | null = null;
    
    for (const update of updates) {
      await query(
        `UPDATE TaskTypes
         SET typeOrder = @typeOrder
         WHERE id = @id`,
        {
          id: update.id,
          typeOrder: update.typeOrder
        }
      );
      
      // Получаем projectId от первого элемента
      if (projectId === null) {
        const projectResult = await query(
          `SELECT projectId FROM TaskTypes WHERE id = @id`,
          { id: update.id }
        );
        if (projectResult.length > 0) {
          projectId = projectResult[0].projectId;
        }
      }
    }

    if (projectId !== null) {
      revalidatePath(`/projects/edit/${projectId}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Ошибка при изменении порядка типов задач:', error);
    return {
      success: false,
      error: error.message || 'Неизвестная ошибка'
    };
  }
}