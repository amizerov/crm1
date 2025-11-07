'use server';

import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { getCurrentUser } from '@/app/(auth)/actions/login';
import { query } from '@/db/connect';

export interface DeleteDocumentResult {
  success: boolean;
  message: string;
}

export async function deleteProjectDocument(
  documentId: number,
  source: 'project' | 'task'
): Promise<DeleteDocumentResult> {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return {
        success: false,
        message: 'Пользователь не авторизован'
      };
    }

    // Получаем информацию о документе
    let documentInfo;
    
    if (source === 'project') {
      const result = await query(`
        SELECT filePath, uploaded_by
        FROM ProjectDocuments
        WHERE id = @documentId
      `, { documentId });
      
      const queryResult = (result as any).recordset || result;
      documentInfo = queryResult && queryResult.length > 0 ? queryResult[0] : null;
    } else {
      const result = await query(`
        SELECT filePath, uploadedBy as uploaded_by
        FROM TaskDocuments
        WHERE id = @documentId
      `, { documentId });
      
      const queryResult = (result as any).recordset || result;
      documentInfo = queryResult && queryResult.length > 0 ? queryResult[0] : null;
    }

    if (!documentInfo) {
      return {
        success: false,
        message: 'Документ не найден'
      };
    }

    // Проверяем права (только загрузивший пользователь может удалить)
    if (documentInfo.uploaded_by !== currentUser.id) {
      return {
        success: false,
        message: 'Недостаточно прав для удаления документа'
      };
    }

    // Удаляем физический файл
    const filePath = join(process.cwd(), 'public', documentInfo.filePath);
    if (existsSync(filePath)) {
      try {
        await unlink(filePath);
      } catch (fileError) {
        console.error('Ошибка при удалении файла:', fileError);
        // Продолжаем удаление из БД даже если файл не удалился
      }
    }

    // Удаляем запись из БД
    if (source === 'project') {
      await query(`
        DELETE FROM ProjectDocuments
        WHERE id = @documentId
      `, { documentId });
    } else {
      await query(`
        DELETE FROM TaskDocuments
        WHERE id = @documentId
      `, { documentId });
    }

    return {
      success: true,
      message: 'Документ успешно удален'
    };
  } catch (error) {
    console.error('Ошибка при удалении документа:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Ошибка при удалении документа'
    };
  }
}
