'use server';

import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { query } from '@/db/connect';
import { getCurrentUser } from '@/app/(auth)/actions/login';
import { notifyProjectMessagesChanged } from '@/lib/projectMessageEvents';

export interface ProjectMessage {
  id: number;
  project_id: number;
  user_id: number;
  description: string;
  dtc: string;
  dtu?: string;
  user_name: string;
}

export interface MessageActionResult {
  success: boolean;
  message: string;
}

interface ProjectMessageRecord {
  id: number;
  project_id: number;
  user_id: number;
  description: string;
}

interface DiscussionAttachment {
  name: string;
  path: string;
}

const ATTACHMENT_PREFIX = '__PROJECT_ATTACHMENT__';

// Получение сообщений чата проекта
export async function getProjectMessages(projectId: number): Promise<ProjectMessage[]> {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return [];
    }

    const result = await query(`
      SELECT 
        pa.id,
        pa.project_id,
        pa.user_id,
        pa.description,
        pa.dtc,
        pa.dtu,
        ISNULL(u.nicName, u.fullName) as user_name
      FROM ProjectActions pa
      LEFT JOIN [Users] u ON pa.user_id = u.id
      WHERE pa.project_id = @projectId
      ORDER BY pa.dtc ASC
    `, {
      projectId
    });

    const messages = (result as any).recordset || result;
    return messages;
  } catch (error) {
    console.error('Ошибка при получении сообщений проекта:', error);
    return [];
  }
}

// Добавление сообщения в чат проекта
export async function addProjectMessage(projectId: number, message: string): Promise<void> {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      throw new Error('Пользователь не авторизован');
    }

    if (!message.trim()) {
      throw new Error('Сообщение не может быть пустым');
    }

    await query(`
      INSERT INTO ProjectActions (project_id, user_id, description, dtc)
      VALUES (@projectId, @userId, @message, GETDATE())
    `, {
      projectId,
      userId: currentUser.id,
      message: message.trim()
    });

    notifyProjectMessagesChanged(projectId);
  } catch (error) {
    console.error('Ошибка при добавлении сообщения:', error);
    throw error;
  }
}

export async function updateProjectMessageText(
  messageId: number,
  text: string
): Promise<MessageActionResult> {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return { success: false, message: 'Пользователь не авторизован' };
    }

    const messageRecord = await getOwnedMessage(messageId, currentUser.id);

    if (!messageRecord) {
      return { success: false, message: 'Сообщение не найдено или недостаточно прав' };
    }

    const parsedMessage = parseMessageDescription(messageRecord.description);
    const nextText = text.trim();

    if (!nextText && parsedMessage.attachments.length === 0) {
      return { success: false, message: 'Сообщение не может быть пустым' };
    }

    await query(`
      UPDATE ProjectActions
      SET description = @description, dtu = GETDATE()
      WHERE id = @messageId
    `, {
      messageId,
      description: buildMessageDescription(nextText, parsedMessage.attachments),
    });
    notifyProjectMessagesChanged(messageRecord.project_id);

    return { success: true, message: 'Сообщение обновлено' };
  } catch (error) {
    console.error('Ошибка при редактировании сообщения:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Ошибка при редактировании сообщения'
    };
  }
}

export async function deleteProjectMessage(messageId: number): Promise<MessageActionResult> {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return { success: false, message: 'Пользователь не авторизован' };
    }

    const messageRecord = await getOwnedMessage(messageId, currentUser.id);

    if (!messageRecord) {
      return { success: false, message: 'Сообщение не найдено или недостаточно прав' };
    }

    const parsedMessage = parseMessageDescription(messageRecord.description);

    for (const attachment of parsedMessage.attachments) {
      await deleteProjectDocumentByPath(messageRecord.project_id, attachment.path);
    }

    await query(`
      DELETE FROM ProjectActions
      WHERE id = @messageId
    `, { messageId });
    notifyProjectMessagesChanged(messageRecord.project_id);

    return { success: true, message: 'Сообщение удалено' };
  } catch (error) {
    console.error('Ошибка при удалении сообщения:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Ошибка при удалении сообщения'
    };
  }
}

export async function deleteProjectMessageAttachment(
  messageId: number,
  attachmentPath: string
): Promise<MessageActionResult> {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return { success: false, message: 'Пользователь не авторизован' };
    }

    const messageRecord = await getOwnedMessage(messageId, currentUser.id);

    if (!messageRecord) {
      return { success: false, message: 'Сообщение не найдено или недостаточно прав' };
    }

    const parsedMessage = parseMessageDescription(messageRecord.description);
    const attachmentToDelete = parsedMessage.attachments.find((attachment) => (
      attachment.path === attachmentPath
    ));

    if (!attachmentToDelete) {
      return { success: false, message: 'Файл не найден в сообщении' };
    }

    const nextAttachments = parsedMessage.attachments.filter((attachment) => (
      attachment.path !== attachmentPath
    ));

    await deleteProjectDocumentByPath(messageRecord.project_id, attachmentToDelete.path);

    if (!parsedMessage.text && nextAttachments.length === 0) {
      await query(`
        DELETE FROM ProjectActions
        WHERE id = @messageId
      `, { messageId });
      notifyProjectMessagesChanged(messageRecord.project_id);

      return { success: true, message: 'Файл и пустое сообщение удалены' };
    }

    await query(`
      UPDATE ProjectActions
      SET description = @description, dtu = GETDATE()
      WHERE id = @messageId
    `, {
      messageId,
      description: buildMessageDescription(parsedMessage.text, nextAttachments),
    });
    notifyProjectMessagesChanged(messageRecord.project_id);

    return { success: true, message: 'Файл удален' };
  } catch (error) {
    console.error('Ошибка при удалении файла из сообщения:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Ошибка при удалении файла'
    };
  }
}

async function getOwnedMessage(
  messageId: number,
  userId: number
): Promise<ProjectMessageRecord | null> {
  const result = await query(`
    SELECT id, project_id, user_id, description
    FROM ProjectActions
    WHERE id = @messageId AND user_id = @userId
  `, {
    messageId,
    userId,
  });

  const queryResult = (result as any).recordset || result;
  return queryResult && queryResult.length > 0 ? queryResult[0] : null;
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

async function deleteProjectDocumentByPath(projectId: number, filePath: string) {
  const documentResult = await query(`
    SELECT id, filePath
    FROM ProjectDocuments
    WHERE project_id = @projectId AND filePath = @filePath
  `, {
    projectId,
    filePath,
  });

  const documents = (documentResult as any).recordset || documentResult;
  const documentInfo = documents && documents.length > 0 ? documents[0] : null;

  if (!documentInfo) {
    return;
  }

  const publicDir = resolve(process.cwd(), 'public');
  const absoluteFilePath = resolve(publicDir, documentInfo.filePath.replace(/^\/+/, ''));

  if (!absoluteFilePath.startsWith(publicDir)) {
    throw new Error('Некорректный путь файла');
  }

  if (existsSync(absoluteFilePath)) {
    await unlink(absoluteFilePath);
  }

  await query(`
    DELETE FROM ProjectDocuments
    WHERE id = @documentId
  `, {
    documentId: documentInfo.id,
  });
}
