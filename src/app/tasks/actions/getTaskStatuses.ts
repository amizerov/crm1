import { query } from '@/db/connect';

type StatusTask = {
  id: number;
  status: string;
  statusEng?: string;
};

export async function getTaskStatuses(): Promise<StatusTask[]> {
  try {
    const result = await query(`
      SELECT id, status, statusEng
      FROM StatusTask
      ORDER BY id
    `);
    
    return result as StatusTask[];
  } catch (error) {
    console.error('Ошибка при получении статусов задач:', error);
    throw new Error('Не удалось получить статусы задач');
  }
}
