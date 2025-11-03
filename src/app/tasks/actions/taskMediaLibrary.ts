'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { getCurrentUser } from '@/app/(auth)/actions/login';

export interface TaskImage {
  name: string;
  path: string;
  size: number;
  lastModified: number;
}

// Получить список изображений задачи
export async function getTaskImages(projectId: number, taskId: number): Promise<{ success: boolean; images?: TaskImage[]; message?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'Не авторизован' };
    }

    const imagesDir = path.join(process.cwd(), 'public', 'media', `p${projectId}`, `t${taskId}`);
    
    try {
      // Проверяем существует ли папка
      await fs.access(imagesDir);
    } catch {
      // Папка не существует - возвращаем пустой массив
      return { success: true, images: [] };
    }

    const files = await fs.readdir(imagesDir);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });

    const images = await Promise.all(
      imageFiles.map(async (filename) => {
        const filePath = path.join(imagesDir, filename);
        const stats = await fs.stat(filePath);
        
        return {
          name: filename,
          path: `/media/p${projectId}/t${taskId}/${filename}`,
          size: stats.size,
          lastModified: stats.mtime.getTime()
        };
      })
    );

    // Сортируем по дате изменения (новые сначала)
    images.sort((a, b) => b.lastModified - a.lastModified);

    return { success: true, images };
  } catch (error) {
    console.error('Ошибка получения списка изображений задачи:', error);
    return { success: false, message: 'Ошибка получения списка изображений' };
  }
}

// Удалить изображение задачи
export async function deleteTaskImage(projectId: number, taskId: number, imagePath: string): Promise<{ success: boolean; message?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'Не авторизован' };
    }

    if (!imagePath || typeof imagePath !== 'string') {
      return { success: false, message: 'Не указан путь к изображению' };
    }

    // Проверяем что путь относится к нужной задаче
    const expectedPrefix = `/media/p${projectId}/t${taskId}/`;
    if (!imagePath.startsWith(expectedPrefix)) {
      return { success: false, message: 'Неверный путь к изображению' };
    }

    // Получаем абсолютный путь к файлу
    const filename = path.basename(imagePath);
    const filePath = path.join(
      process.cwd(), 
      'public', 
      'media', 
      `p${projectId}`,
      `t${taskId}`,
      filename
    );

    // Проверяем что файл существует
    try {
      await fs.access(filePath);
    } catch {
      return { success: false, message: 'Файл не найден' };
    }

    // Удаляем файл
    await fs.unlink(filePath);

    return { success: true, message: 'Изображение удалено' };
  } catch (error) {
    console.error('Ошибка удаления изображения задачи:', error);
    return { success: false, message: 'Ошибка удаления изображения' };
  }
}