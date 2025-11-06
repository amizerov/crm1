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
      
      documentInfo = result && result.length > 0 ? result[0] : null;
    } else {
      const result = await query(`
        SELECT filePath, uploadedBy as uploaded_by
        FROM TaskDocuments
        WHERE id = @documentId
      `, { documentId });
      
      documentInfo = result && result.length > 0 ? result[0] : null;
    }

    if (!documentInfo) {
      return {
        success: false,
        message: 'Документ не найден'
      };
    }

    // Проверяем права (только загрузивший пользователь или админ может удалить)
    // TODO: добавить проверку на админа
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

// Удаление файла напрямую из файловой системы (для файлов без записи в БД)
export async function deleteProjectFile(
  projectId: number,
  filePath: string
): Promise<DeleteDocumentResult> {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return {
        success: false,
        message: 'Пользователь не авторизован'
      };
    }

    // Проверяем, что путь начинается с правильной папки проекта для безопасности
    const expectedPrefix = `/media/p${projectId}/`;
    if (!filePath.startsWith(expectedPrefix)) {
      return {
        success: false,
        message: 'Неверный путь к файлу'
      };
    }

    // Удаляем физический файл
    const fullPath = join(process.cwd(), 'public', filePath);
    if (!existsSync(fullPath)) {
      return {
        success: false,
        message: 'Файл не найден'
      };
    }

    try {
      await unlink(fullPath);
    } catch (fileError) {
      console.error('Ошибка при удалении файла:', fileError);
      return {
        success: false,
        message: 'Ошибка при удалении файла'
      };
    }

    return {
      success: true,
      message: 'Файл успешно удален'
    };
  } catch (error) {
    console.error('Ошибка при удалении файла:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Ошибка при удалении файла'
    };
  }
}
