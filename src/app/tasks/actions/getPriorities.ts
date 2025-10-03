'use server'

import { query } from '@/db/connect';

type Priority = {
  id: number;
  priority: string;
  priorityEng?: string;
};

export async function getPriorities(): Promise<Priority[]> {
  try {
    const result = await query(`
      SELECT id, priority, priorityEng
      FROM Priority
      ORDER BY id
    `);
    
    return result as Priority[];
  } catch (error) {
    console.error('Ошибка при получении приоритетов:', error);
    throw new Error('Не удалось получить приоритеты');
  }
}
