'use server';

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getCurrentUser } from '@/app/(auth)/actions/login';
import { validateFileComprehensive, sanitizeFileName } from '@/lib/fileValidation';

export async function uploadProjectImage(projectId: number, formData: FormData) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, message: 'Пользователь не авторизован' };
    }

    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, message: 'Файл не выбран' };
    }

    // КРИТИЧНО: Комплексная валидация файла
    const validation = await validateFileComprehensive(file, 'image', 5 * 1024 * 1024);
    if (!validation.valid) {
      console.warn(`⚠️ Попытка загрузки недопустимого файла: ${file.name} от пользователя ${currentUser.id}`);
      return { 
        success: false, 
        message: validation.error || 'Файл не прошел проверку безопасности' 
      };
    }

    // Создаем папку public/media/p{projectId}
    const projectDir = join(process.cwd(), 'public', 'media', `p${projectId}`);
    await mkdir(projectDir, { recursive: true });

    // Генерируем безопасное имя файла
    const extension = file.name.split('.').pop() || 'png';
    const timestamp = Date.now();
    const safeName = sanitizeFileName(file.name.replace(/\.[^/.]+$/, '')); // Имя без расширения
    const fileName = `${timestamp}_${safeName}.${extension}`;
    
    const filePath = join(projectDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Возвращаем относительный путь для использования в <img>
    const relativePath = `/media/p${projectId}/${fileName}`;
    
    return { 
      success: true, 
      path: relativePath,
      message: 'Изображение успешно загружено' 
    };

  } catch (error: any) {
    console.error('Ошибка загрузки изображения:', error);
    return { 
      success: false, 
      message: error.message || 'Ошибка загрузки изображения' 
    };
  }
}
