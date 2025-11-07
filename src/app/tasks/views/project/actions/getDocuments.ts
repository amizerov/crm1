'use server';

import { query } from '@/db/connect';
import { getCurrentUser } from '@/app/(auth)/actions/login';

export interface ProjectDocument {
  id: number;
  filename: string;
  originalName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  uploaded_by: number;
  uploaded_at: string;
  uploader_name: string;
  source: 'project' | 'task';
  task_id?: number;
  task_title?: string;
}

// Получение документов проекта из таблицы ProjectDocuments
export async function getProjectDocuments(projectId: number): Promise<ProjectDocument[]> {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return [];
    }

    const result = await query(`
      SELECT 
        pd.id,
        pd.filename,
        pd.originalName,
        pd.filePath,
        pd.mimeType,
        pd.fileSize,
        pd.uploaded_by,
        pd.uploaded_at,
        ISNULL(u.nicName, u.fullName) as uploader_name,
        'project' as source
      FROM ProjectDocuments pd
      LEFT JOIN [Users] u ON pd.uploaded_by = u.id
      WHERE pd.project_id = @projectId
      ORDER BY pd.uploaded_at DESC
    `, {
      projectId
    });

    const documents = (result as any).recordset || result;
    return documents;
  } catch (error) {
    console.error('Ошибка при получении документов проекта:', error);
    return [];
  }
}

// Получение документов задач проекта из таблицы TaskDocuments
export async function getTaskDocuments(projectId: number): Promise<ProjectDocument[]> {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return [];
    }

    const result = await query(`
      SELECT 
        td.id,
        td.filename,
        td.originalName,
        td.filePath,
        td.mimeType,
        td.fileSize,
        td.uploadedBy as uploaded_by,
        td.dtc as uploaded_at,
        ISNULL(u.nicName, u.fullName) as uploader_name,
        'task' as source,
        t.id as task_id,
        t.taskName as task_title
      FROM TaskDocuments td
      INNER JOIN Task t ON td.taskId = t.id
      LEFT JOIN [Users] u ON td.uploadedBy = u.id
      WHERE t.projectId = @projectId
      ORDER BY td.dtc DESC
    `, {
      projectId
    });

    const documents = (result as any).recordset || result;
    return documents;
  } catch (error) {
    console.error('Ошибка при получении документов задач:', error);
    return [];
  }
}