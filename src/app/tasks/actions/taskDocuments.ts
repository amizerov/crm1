'use server';

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { query } from '@/db/connect';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/app/(auth)/actions/login';
import { logTaskHistory } from './taskHistory';

export async function uploadTaskDocument(taskId: number, formData: FormData) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error('Пользователь не авторизован');
    }

    const file = formData.get('file') as File;
    if (!file) {
      throw new Error('Файл не выбран');
    }

    const isChunk = formData.get('isChunk') === 'true';
    const chunkIndex = formData.get('chunkIndex');
    const totalChunks = formData.get('totalChunks');
    const originalName = formData.get('originalName') as string;
    const fileId = formData.get('fileId') as string;

    // Получаем projectId для задачи
    const taskInfo = await query(`
      SELECT projectId FROM Task WHERE id = @taskId
    `, { taskId });

    if (!taskInfo || taskInfo.length === 0) {
      throw new Error('Задача не найдена');
    }

    const projectId = taskInfo[0].projectId;
    if (!projectId) {
      throw new Error('Задача не связана с проектом');
    }

    // Создаем папку media/p{projectId}/t{taskId} если её нет
    const uploadsDir = join(process.cwd(), 'public', 'media', `p${projectId}`, `t${taskId}`);
    await mkdir(uploadsDir, { recursive: true });

    // Используем оригинальное имя файла без изменений
    const fileName = originalName || file.name;
    
    if (isChunk) {
      // Обработка чанков
      const tempDir = join(uploadsDir, 'temp');
      await mkdir(tempDir, { recursive: true });
      
      // Для чанков добавляем fileId только для временных файлов
      const tempFileName = `${fileId}_${fileName}`;
      const chunkPath = join(tempDir, `${tempFileName}.part${chunkIndex}`);
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(chunkPath, buffer);

      // Если это последний чанк - собираем файл
      const currentChunk = parseInt(chunkIndex as string);
      const total = parseInt(totalChunks as string);
      
      if (currentChunk === total - 1) {
        // Собираем все чанки
        const chunks: Buffer[] = [];
        let totalSize = 0;
        
        for (let i = 0; i < total; i++) {
          const partPath = join(tempDir, `${tempFileName}.part${i}`);
          const fs = require('fs');
          const partBuffer = fs.readFileSync(partPath);
          chunks.push(partBuffer);
          totalSize += partBuffer.length;
          
          // Удаляем временный чанк
          fs.unlinkSync(partPath);
        }
        
        // Объединяем чанки и сохраняем с оригинальным именем
        const finalBuffer = Buffer.concat(chunks);
        const filePath = join(uploadsDir, fileName);
        await writeFile(filePath, finalBuffer);
        
        // Сохраняем информацию о файле в БД
        await query(`
          INSERT INTO TaskDocuments 
          (taskId, fileName, originalName, filePath, fileSize, mimeType, uploadedBy)
          VALUES (@taskId, @fileName, @originalName, @filePath, @fileSize, @mimeType, @uploadedBy)
        `, {
          taskId,
          fileName,
          originalName: fileName,
          filePath: `/media/p${projectId}/t${taskId}/${fileName}`,
          fileSize: totalSize,
          mimeType: file.type || 'application/octet-stream',
          uploadedBy: currentUser.id
        });
        
        // Логируем в историю
        await logTaskHistory(taskId, {
          actionType: 'document_added',
          newValue: fileName
        });
        
        revalidatePath(`/tasks/edit/${taskId}`);
        return { success: true, message: 'Документ успешно загружен' };
      }
      
      // Промежуточный чанк загружен успешно
      return { success: true, message: `Чанк ${currentChunk + 1}/${total} загружен` };
      
    } else {
      // Обычная загрузка для маленьких файлов
      const filePath = join(uploadsDir, fileName);
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      // Сохраняем информацию о файле в БД
      await query(`
        INSERT INTO TaskDocuments 
        (taskId, fileName, originalName, filePath, fileSize, mimeType, uploadedBy)
        VALUES (@taskId, @fileName, @originalName, @filePath, @fileSize, @mimeType, @uploadedBy)
      `, {
        taskId,
        fileName,
        originalName: fileName,
        filePath: `/media/p${projectId}/t${taskId}/${fileName}`,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
        uploadedBy: currentUser.id
      });

      // Логируем в историю
      await logTaskHistory(taskId, {
        actionType: 'document_added',
        newValue: fileName
      });

      revalidatePath(`/tasks/edit/${taskId}`);
      return { success: true, message: 'Документ успешно загружен' };
    }

  } catch (error: any) {
    console.error('Ошибка загрузки документа:', error);
    return { success: false, message: error.message || 'Ошибка загрузки документа' };
  }
}

export async function getTaskDocuments(taskId: number) {
  try {
    const result = await query(`
      SELECT 
        td.id,
        td.fileName,
        td.originalName,
        td.filePath,
        td.fileSize,
        td.mimeType,
        td.dtc,
        u.nicName as uploadedByName
      FROM TaskDocuments td
      LEFT JOIN [Users] u ON td.uploadedBy = u.id
      WHERE td.taskId = @taskId
      ORDER BY td.dtc DESC
    `, { taskId });

    return result || [];
  } catch (error) {
    console.error('Ошибка получения документов:', error);
    return [];
  }
}

export async function deleteTaskDocument(documentId: number, taskId: number) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error('Пользователь не авторизован');
    }

    // Получаем информацию о файле
    const fileInfo = await query(
      'SELECT filePath, originalName FROM TaskDocuments WHERE id = @id',
      { id: documentId }
    );

    const originalName = fileInfo && fileInfo.length > 0 ? fileInfo[0].originalName : null;

    if (fileInfo && fileInfo.length > 0) {
      // Удаляем файл с диска
      const fs = require('fs').promises;
      const fullPath = join(process.cwd(), 'public', fileInfo[0].filePath);
      try {
        await fs.unlink(fullPath);
      } catch (err) {
        console.warn('Файл уже удален или не найден:', fullPath);
      }
    }

    // Удаляем запись из БД
    await query(
      'DELETE FROM TaskDocuments WHERE id = @id',
      { id: documentId }
    );

    // Логируем в историю
    if (originalName) {
      await logTaskHistory(taskId, {
        actionType: 'document_deleted',
        oldValue: originalName
      });
    }

    revalidatePath(`/tasks/edit/${taskId}`);
    return { success: true, message: 'Документ удален' };

  } catch (error: any) {
    console.error('Ошибка удаления документа:', error);
    return { success: false, message: error.message || 'Ошибка удаления документа' };
  }
}
