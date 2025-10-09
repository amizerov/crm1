'use server';

import { query } from '@/db/connect';
import { getCurrentUser } from '@/app/(auth)/actions/login';
import { revalidatePath } from 'next/cache';

export interface TaskHistoryEntry {
  actionType: 'created' | 'status_changed' | 'assigned' | 'priority_changed' | 
               'updated' | 'deleted' | 'document_added' | 'document_deleted' | 
               'comment_added' | 'comment_edited' | 'comment_deleted' | 
               'moved' | 'deadline_changed' | 'startdate_changed' | 'description_changed' |
               'name_changed' | 'executor_changed' | 'order_changed';
  fieldName?: string;
  oldValue?: string | null;
  newValue?: string | null;
  description?: string;
}

/**
 * Записывает событие в историю задачи
 */
export async function logTaskHistory(
  taskId: number,
  entry: TaskHistoryEntry
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'Пользователь не авторизован' };
    }

    const description = entry.description || await generateHistoryDescription(entry.actionType, entry.fieldName, entry.oldValue, entry.newValue);

    await query(`
      INSERT INTO TaskHistory (taskId, userId, actionType, fieldName, oldValue, newValue, description)
      VALUES (@taskId, @userId, @actionType, @fieldName, @oldValue, @newValue, @description)
    `, {
      taskId,
      userId: user.id,
      actionType: entry.actionType,
      fieldName: entry.fieldName || null,
      oldValue: entry.oldValue || null,
      newValue: entry.newValue || null,
      description: description
    });

    // Инвалидируем кеш для обновления данных
    revalidatePath('/tasks');

    return { success: true };
  } catch (error) {
    console.error('Ошибка записи истории задачи:', error);
    return { success: false, message: 'Ошибка записи истории' };
  }
}

/**
 * Получает историю задачи
 */
export async function getTaskHistory(taskId: number) {
  try {
    const result = await query(`
      SELECT 
        th.id,
        th.actionType,
        th.fieldName,
        th.oldValue,
        th.newValue,
        th.description,
        th.dtc,
        u.nicName as userName,
        u.fullName as userFullName
      FROM TaskHistory th
      LEFT JOIN [User] u ON th.userId = u.id
      WHERE th.taskId = @taskId
      ORDER BY th.dtc DESC
    `, { taskId });

    return result || [];
  } catch (error) {
    console.error('Ошибка получения истории задачи:', error);
    return [];
  }
}

/**
 * Генерирует описание изменения на основе типа действия
 */
export async function generateHistoryDescription(
  actionType: TaskHistoryEntry['actionType'],
  fieldName?: string,
  oldValue?: string | null,
  newValue?: string | null
): Promise<string> {
  // Функция для форматирования значений
  const formatValue = (value: string | null | undefined, isDate = false): string => {
    if (!value || value === 'null' || value === 'undefined') {
      return 'Не указан';
    }
    
    if (isDate) {
      try {
        // Парсим дату в формате DD.MM.YYYY или YYYY-MM-DD или другом
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      } catch (e) {
        // Если не удалось распарсить как дату, возвращаем как есть
      }
    }
    
    return value;
  };

  switch (actionType) {
    case 'created':
      return 'создал(а) задачу';
    case 'status_changed':
      return `изменил(а) статус с "${formatValue(oldValue)}" на "${formatValue(newValue)}"`;
    case 'assigned':
      return oldValue 
        ? `переназначил(а) задачу с ${formatValue(oldValue)} на ${formatValue(newValue)}`
        : `назначил(а) исполнителя: ${formatValue(newValue)}`;
    case 'executor_changed':
      return oldValue 
        ? `изменил(а) исполнителя с "${formatValue(oldValue)}" на "${formatValue(newValue)}"`
        : `назначил(а) исполнителя: ${formatValue(newValue)}`;
    case 'priority_changed':
      return `изменил(а) приоритет с "${formatValue(oldValue)}" на "${formatValue(newValue)}"`;
    case 'deadline_changed':
      return oldValue 
        ? `изменил(а) дедлайн с ${formatValue(oldValue, true)} на ${formatValue(newValue, true)}`
        : `установил(а) дедлайн: ${formatValue(newValue, true)}`;
    case 'startdate_changed':
      return oldValue
        ? `изменил(а) дату начала с ${formatValue(oldValue, true)} на ${formatValue(newValue, true)}`
        : `установил(а) дату начала: ${formatValue(newValue, true)}`;
    case 'name_changed':
      return `изменил(а) название с "${formatValue(oldValue)}" на "${formatValue(newValue)}"`;
    case 'description_changed':
      return 'изменил(а) описание задачи';
    case 'document_added':
      return `добавил(а) документ: ${formatValue(newValue)}`;
    case 'document_deleted':
      return `удалил(а) документ: ${formatValue(oldValue)}`;
    case 'comment_added':
      return 'добавил(а) комментарий';
    case 'comment_edited':
      return 'отредактировал(а) комментарий';
    case 'comment_deleted':
      return 'удалил(а) комментарий';
    case 'moved':
      return `переместил(а) задачу в "${formatValue(newValue)}"`;
    case 'order_changed':
      if (fieldName === 'status_and_order') {
        return `переместил(а) задачу из "${formatValue(oldValue)}" в "${formatValue(newValue)}"`;
      }
      return `изменил(а) порядок задачи`;
    case 'updated':
      return fieldName 
        ? `изменил(а) ${fieldName}: "${formatValue(oldValue)}" → "${formatValue(newValue)}"`
        : 'обновил(а) задачу';
    case 'deleted':
      return 'удалил(а) задачу';
    default:
      return 'выполнил(а) действие';
  }
}
