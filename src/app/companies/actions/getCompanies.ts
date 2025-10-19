import { query } from '@/db/connect';

export async function getCompanies() {
  try {
    const companies = await query(`
      SELECT 
        c.id,
        c.companyName,
        c.ownerId,
        u.nicName as ownerName
      FROM Company c
      LEFT JOIN [Users] u ON c.ownerId = u.id
      ORDER BY c.companyName
    `);
    
    return companies;
  } catch (error) {
    console.error('Ошибка при получении компаний:', error);
    throw new Error('Не удалось получить список компаний');
  }
}

