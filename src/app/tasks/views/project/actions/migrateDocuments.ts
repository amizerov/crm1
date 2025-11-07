'use server';

import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { getCurrentUser } from '@/app/(auth)/actions/login';
import { query } from '@/db/connect';

export interface MigrationResult {
  success: boolean;
  message: string;
  processed: number;
  skipped: number;
  errors: number;
  details: string[];
}

export async function migrateProjectDocuments(): Promise<MigrationResult> {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return {
        success: false,
        message: 'Пользователь не авторизован',
        processed: 0,
        skipped: 0,
        errors: 0,
        details: []
      };
    }

    const mediaDir = join(process.cwd(), 'public', 'media');
    let processed = 0;
    let skipped = 0;
    let errors = 0;
    const details: string[] = [];

    try {
      const projectFolders = await readdir(mediaDir, { withFileTypes: true });
      
      for (const folder of projectFolders) {
        // Обрабатываем только папки проектов (начинающиеся с 'p')
        if (!folder.isDirectory() || !folder.name.startsWith('p')) {
          continue;
        }

        const projectIdMatch = folder.name.match(/^p(\d+)$/);
        if (!projectIdMatch) {
          details.push(`⚠️ Пропущена папка: ${folder.name} (неверный формат)`);
          continue;
        }

        const projectId = parseInt(projectIdMatch[1]);
        details.push(`🔍 Обрабатываем проект ID: ${projectId}`);

        // Проверяем, существует ли проект в БД
        const projectExists = await query(`
          SELECT id FROM Project WHERE id = @projectId
        `, { projectId });

        const projectResult = (projectExists as any).recordset || projectExists;
        if (!projectResult || projectResult.length === 0) {
          details.push(`❌ Проект ID: ${projectId} не найден в БД`);
          errors++;
          continue;
        }

        const projectDir = join(mediaDir, folder.name);
        
        try {
          const files = await readdir(projectDir, { withFileTypes: true });
          
          for (const file of files) {
            // Пропускаем папки задач (начинающиеся с 't')
            if (file.isDirectory()) {
              if (file.name.startsWith('t')) {
                details.push(`⏭️ Пропущена папка задачи: ${file.name}`);
              }
              continue;
            }

            // Обрабатываем только файлы
            if (!file.isFile()) {
              continue;
            }

            const filePath = join(projectDir, file.name);
            const dbFilePath = `/media/p${projectId}/${file.name}`;

            try {
              // Проверяем, не зарегистрирован ли уже этот файл
              const existingFile = await query(`
                SELECT id FROM ProjectDocuments 
                WHERE project_id = @projectId AND filePath = @filePath
              `, { projectId, filePath: dbFilePath });

              const existingResult = (existingFile as any).recordset || existingFile;
              if (existingResult && existingResult.length > 0) {
                details.push(`⏭️ Файл уже зарегистрирован: ${file.name}`);
                skipped++;
                continue;
              }

              // Получаем информацию о файле
              const fileStats = await stat(filePath);
              
              // Определяем MIME-тип по расширению
              const extension = file.name.split('.').pop()?.toLowerCase() || '';
              const mimeType = getMimeType(extension);

              // Извлекаем оригинальное имя из имени файла (убираем timestamp если есть)
              let originalName = file.name;
              const timestampMatch = file.name.match(/^(\d{13})_(.+)$/);
              if (timestampMatch) {
                originalName = timestampMatch[2];
              }

              // Регистрируем файл в БД
              await query(`
                INSERT INTO ProjectDocuments (
                  project_id, filename, originalName, filePath, 
                  mimeType, fileSize, uploaded_by
                )
                VALUES (
                  @projectId, @filename, @originalName, @filePath,
                  @mimeType, @fileSize, @userId
                )
              `, {
                projectId,
                filename: file.name,
                originalName,
                filePath: dbFilePath,
                mimeType,
                fileSize: fileStats.size,
                userId: currentUser.id
              });

              details.push(`✅ Зарегистрирован: ${file.name} (${formatFileSize(fileStats.size)})`);
              processed++;

            } catch (fileError) {
              details.push(`❌ Ошибка обработки файла ${file.name}: ${fileError instanceof Error ? fileError.message : 'Неизвестная ошибка'}`);
              errors++;
            }
          }
        } catch (dirError) {
          details.push(`❌ Ошибка чтения папки проекта ${projectId}: ${dirError instanceof Error ? dirError.message : 'Неизвестная ошибка'}`);
          errors++;
        }
      }
    } catch (mediaDirError) {
      details.push(`❌ Ошибка доступа к папке media: ${mediaDirError instanceof Error ? mediaDirError.message : 'Неизвестная ошибка'}`);
      errors++;
    }

    const message = `Миграция завершена: обработано ${processed}, пропущено ${skipped}, ошибок ${errors}`;
    
    return {
      success: errors === 0 || processed > 0,
      message,
      processed,
      skipped,
      errors,
      details
    };

  } catch (error) {
    console.error('Ошибка миграции документов:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Ошибка миграции документов',
      processed: 0,
      skipped: 0,
      errors: 1,
      details: ['❌ Критическая ошибка миграции']
    };
  }
}

function getMimeType(extension: string): string {
  const mimeTypes: { [key: string]: string } = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'txt': 'text/plain',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'svg': 'image/svg+xml',
    'webp': 'image/webp',
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav'
  };
  
  return mimeTypes[extension] || 'application/octet-stream';
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}