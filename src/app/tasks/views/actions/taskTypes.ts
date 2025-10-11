'use server';

import { query } from '@/db/connect';

export interface TaskType {
  id: number;
  projectId: number;
  typeName: string;
  typeOrder: number;
  typeColor: string | null;
}

export async function getTaskTypes(projectId: number): Promise<TaskType[]> {
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