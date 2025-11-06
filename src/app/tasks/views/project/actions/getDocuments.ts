'use server';

import { query } from '@/db/connect';
import { getCurrentUser } from '@/app/(auth)/actions/login';

export interface ProjectDocument {
  id: number;
  project_id: number;
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

// Получение всех документов проекта (только из задач)
export async function getProjectDocuments(projectId: number): Promise<ProjectDocument[]> {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return [];
    }

    const result = await query(`
      -- Только документы из задач проекта  
      SELECT 
        td.id,
        t.projectId as project_id,
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
      
      ORDER BY uploaded_at DESC
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

// Загрузка документа проекта (заглушка для будущей реализации)
export async function uploadProjectDocument(
  projectId: number, 
  filename: string, 
  originalName: string, 
  filePath: string, 
  mimeType: string, 
  fileSize: number
): Promise<void> {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new Error('Пользователь не авторизован');
    }

    await query(`
      INSERT INTO ProjectDocuments (
        project_id, filename, originalName, filePath, 
        mimeType, fileSize, uploaded_by, uploaded_at
      )
      VALUES (
        @projectId, @filename, @originalName, @filePath,
        @mimeType, @fileSize, @userId, GETDATE()
      )
    `, {
      projectId,
      filename,
      originalName,
      filePath,
      mimeType,
      fileSize,
      userId: currentUser.id
    });
  } catch (error) {
    console.error('Ошибка при загрузке документа:', error);
    throw error;
  }
}