'use server';

import { query } from '@/db/connect';
import { getCurrentUser } from '@/app/(auth)/actions/login';

export interface ProjectMessage {
  id: number;
  project_id: number;
  user_id: number;
  description: string;
  dtc: string;
  dtu?: string;
  user_name: string;
}

// Получение сообщений чата проекта
export async function getProjectMessages(projectId: number): Promise<ProjectMessage[]> {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return [];
    }

    const result = await query(`
      SELECT 
        pa.id,
        pa.project_id,
        pa.user_id,
        pa.description,
        pa.dtc,
        pa.dtu,
        ISNULL(u.nicName, u.fullName) as user_name
      FROM ProjectActions pa
      LEFT JOIN [Users] u ON pa.user_id = u.id
      WHERE pa.project_id = @projectId
      ORDER BY pa.dtc ASC
    `, {
      projectId
    });

    const messages = (result as any).recordset || result;
    return messages;
  } catch (error) {
    console.error('Ошибка при получении сообщений проекта:', error);
    return [];
  }
}

// Добавление сообщения в чат проекта
export async function addProjectMessage(projectId: number, message: string): Promise<void> {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new Error('Пользователь не авторизован');
    }

    if (!message.trim()) {
      throw new Error('Сообщение не может быть пустым');
    }

    await query(`
      INSERT INTO ProjectActions (project_id, user_id, description, dtc)
      VALUES (@projectId, @userId, @message, GETDATE())
    `, {
      projectId,
      userId: currentUser.id,
      message: message.trim()
    });
  } catch (error) {
    console.error('Ошибка при добавлении сообщения:', error);
    throw error;
  }
}