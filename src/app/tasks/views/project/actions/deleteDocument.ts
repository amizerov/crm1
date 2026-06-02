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
        SELECT project_id, filePath, uploaded_by
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

      await removeDocumentLinksFromProjectMessages(documentInfo.project_id, documentInfo.filePath);
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

interface DiscussionAttachment {
  name: string;
  path: string;
}

const ATTACHMENT_PREFIX = '__PROJECT_ATTACHMENT__';

async function removeDocumentLinksFromProjectMessages(projectId: number, filePath: string) {
  const result = await query(`
    SELECT id, description
    FROM ProjectActions
    WHERE project_id = @projectId AND description LIKE @attachmentPattern
  `, {
    projectId,
    attachmentPattern: `%${filePath}%`,
  });

  const messages = (result as any).recordset || result;

  for (const message of messages) {
    const parsedMessage = parseMessageDescription(message.description);
    const nextAttachments = parsedMessage.attachments.filter((attachment) => (
      attachment.path !== filePath
    ));

    if (nextAttachments.length === parsedMessage.attachments.length) {
      continue;
    }

    if (!parsedMessage.text && nextAttachments.length === 0) {
      await query(`
        DELETE FROM ProjectActions
        WHERE id = @messageId
      `, {
        messageId: message.id,
      });
    } else {
      await query(`
        UPDATE ProjectActions
        SET description = @description, dtu = GETDATE()
        WHERE id = @messageId
      `, {
        messageId: message.id,
        description: buildMessageDescription(parsedMessage.text, nextAttachments),
      });
    }
  }
}

function parseMessageDescription(description: string) {
  const lines = description.split('\n');
  const textLines: string[] = [];
  const attachments: DiscussionAttachment[] = [];

  for (const line of lines) {
    if (line.startsWith(ATTACHMENT_PREFIX)) {
      try {
        attachments.push(JSON.parse(line.slice(ATTACHMENT_PREFIX.length)));
      } catch {
        textLines.push(line);
      }
    } else {
      textLines.push(line);
    }
  }

  return {
    text: textLines.join('\n').trim(),
    attachments,
  };
}

function buildMessageDescription(text: string, attachments: DiscussionAttachment[]) {
  const attachmentLines = attachments.map((attachment) => (
    `${ATTACHMENT_PREFIX}${JSON.stringify(attachment)}`
  ));

  return [
    text.trim(),
    ...attachmentLines,
  ].filter(Boolean).join('\n');
}
