'use server';

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getCurrentUser } from '@/app/(auth)/actions/login';

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

    // Валидация типа файла
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, message: 'Допустимы только изображения (JPEG, PNG, GIF, WebP)' };
    }

    // Валидация размера (макс 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { success: false, message: 'Размер файла не должен превышать 5 МБ' };
    }

    // Создаем папку public/projectdescription/{projectId}
    const projectDir = join(process.cwd(), 'public', 'projectdescription', projectId.toString());
    await mkdir(projectDir, { recursive: true });

    // Генерируем имя файла: timestamp + оригинальное расширение
    const extension = file.name.split('.').pop() || 'png';
    const timestamp = Date.now();
    const fileName = `${timestamp}.${extension}`;
    
    const filePath = join(projectDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Возвращаем относительный путь для использования в <img>
    const relativePath = `/projectdescription/${projectId}/${fileName}`;
    
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
