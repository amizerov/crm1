'use server';

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { getCurrentUser } from '@/app/(auth)/actions/login';
import { query } from '@/db/connect';

export interface UploadDocumentResult {
  success: boolean;
  message: string;
  documentId?: number;
}

export async function uploadProjectDocument(
  projectId: number,
  formData: FormData
): Promise<UploadDocumentResult> {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return {
        success: false,
        message: 'Пользователь не авторизован'
      };
    }

    const file = formData.get('file') as File;
    
    if (!file) {
      return {
        success: false,
        message: 'Файл не найден'
      };
    }

    // Проверка размера файла (максимум 50 МБ)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        success: false,
        message: 'Размер файла не должен превышать 50 МБ'
      };
    }

    // Создаем уникальное имя файла с timestamp
    const timestamp = Date.now();
    const originalExtension = file.name.split('.').pop() || '';
    const filename = `${timestamp}_${file.name}`;
    
    // Создаем путь для сохранения: public/media/p{projectId}/
    const uploadDir = join(process.cwd(), 'public', 'media', `p${projectId}`);
    
    // Создаем директорию, если она не существует
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filePath = join(uploadDir, filename);

    // Сохраняем файл
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Путь для БД (относительный)
    const dbFilePath = `/media/p${projectId}/${filename}`;

    // Сохраняем информацию о файле в БД
    const result = await query(`
      INSERT INTO ProjectDocuments (
        project_id, filename, originalName, filePath, 
        mimeType, fileSize, uploaded_by
      )
      OUTPUT INSERTED.id
      VALUES (
        @projectId, @filename, @originalName, @filePath,
        @mimeType, @fileSize, @userId
      )
    `, {
      projectId,
      filename,
      originalName: file.name,
      filePath: dbFilePath,
      mimeType: file.type || 'application/octet-stream',
      fileSize: file.size,
      userId: currentUser.id
    });

    const insertResult = (result as any).recordset || result;
    const insertedId = insertResult && insertResult.length > 0 ? insertResult[0]?.id : undefined;

    return {
      success: true,
      message: 'Документ успешно загружен',
      documentId: insertedId
    };
  } catch (error) {
    console.error('Ошибка при загрузке документа:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Ошибка при загрузке документа'
    };
  }
}
