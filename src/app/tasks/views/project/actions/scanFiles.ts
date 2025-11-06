'use server';

import { readdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { getCurrentUser } from '@/app/(auth)/actions/login';

export interface FileSystemDocument {
  name: string;
  path: string;
  size: number;
  mimeType: string;
  source: 'project' | 'task';
  taskId?: number;
  modified: string;
}

export async function scanProjectFiles(projectId: number): Promise<FileSystemDocument[]> {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return [];
    }

    const projectDir = join(process.cwd(), 'public', 'media', `p${projectId}`);
    
    if (!existsSync(projectDir)) {
      return [];
    }

    const files: FileSystemDocument[] = [];

    // Сканируем корневую папку проекта
    const projectFiles = await readdir(projectDir, { withFileTypes: true });
    
    for (const file of projectFiles) {
      if (file.isFile()) {
        const filePath = join(projectDir, file.name);
        const stats = await stat(filePath);
        
        files.push({
          name: file.name,
          path: `/media/p${projectId}/${file.name}`,
          size: stats.size,
          mimeType: getMimeType(file.name),
          source: 'project',
          modified: stats.mtime.toISOString()
        });
      } else if (file.isDirectory() && file.name.startsWith('t')) {
        // Это папка задачи
        const taskId = parseInt(file.name.substring(1));
        const taskDir = join(projectDir, file.name);
        const taskFiles = await readdir(taskDir);
        
        for (const taskFile of taskFiles) {
          const taskFilePath = join(taskDir, taskFile);
          const taskStats = await stat(taskFilePath);
          
          if (taskStats.isFile()) {
            files.push({
              name: taskFile,
              path: `/media/p${projectId}/${file.name}/${taskFile}`,
              size: taskStats.size,
              mimeType: getMimeType(taskFile),
              source: 'task',
              taskId,
              modified: taskStats.mtime.toISOString()
            });
          }
        }
      }
    }

    return files.sort((a, b) => 
      new Date(b.modified).getTime() - new Date(a.modified).getTime()
    );
  } catch (error) {
    console.error('Ошибка при сканировании файлов проекта:', error);
    return [];
  }
}

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  const mimeTypes: { [key: string]: string } = {
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    
    // Documents
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    
    // Text
    'txt': 'text/plain',
    'csv': 'text/csv',
    'json': 'application/json',
    'xml': 'application/xml',
    
    // Archives
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    
    // Other
    'mp4': 'video/mp4',
    'mp3': 'audio/mpeg',
  };
  
  return mimeTypes[ext || ''] || 'application/octet-stream';
}
