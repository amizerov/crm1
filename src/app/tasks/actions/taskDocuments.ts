'use server';

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { query } from '@/db/connect';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/db/loginUser';

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

    // Проверка размера файла (максимум 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Размер файла не должен превышать 10MB');
    }

    // Создаем папку uploads/tasks если её нет
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'tasks');
    await mkdir(uploadsDir, { recursive: true });

    // Генерируем уникальное имя файла
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${cleanFileName}`;
    const filePath = join(uploadsDir, fileName);

    // Сохраняем файл
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
      originalName: file.name,
      filePath: `/uploads/tasks/${fileName}`,
      fileSize: file.size,
      mimeType: file.type || 'application/octet-stream',
      uploadedBy: currentUser.id
    });

    revalidatePath(`/tasks/edit/${taskId}`);
    return { success: true, message: 'Документ успешно загружен' };

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
      LEFT JOIN [User] u ON td.uploadedBy = u.id
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
      'SELECT filePath FROM TaskDocuments WHERE id = @id',
      { id: documentId }
    );

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

    revalidatePath(`/tasks/edit/${taskId}`);
    return { success: true, message: 'Документ удален' };

  } catch (error: any) {
    console.error('Ошибка удаления документа:', error);
    return { success: false, message: error.message || 'Ошибка удаления документа' };
  }
}
