'use server';

import { query } from '@/db/connect';
import { getCurrentUser } from '@/app/(auth)/actions/login';

export interface Project {
  id: number;
  projectName: string;
}

// Получение проектов по компании для фильтра
export async function getProjectsByCompanyForFilter(companyId?: number): Promise<Project[]> {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return [];
    }

    // Если companyId не указан, возвращаем пустой массив
    if (!companyId) {
      return [];
    }

    const result = await query(`
      SELECT 
        p.id,
        p.projectName
      FROM Project p
      WHERE p.companyId = @companyId
        AND p.companyId IN (
          -- Проверяем доступ к компании
          SELECT DISTINCT companyId 
          FROM Employee 
          WHERE userId = @userId
          
          UNION
          
          SELECT id 
          FROM Company 
          WHERE ownerId = @userId
        )
      ORDER BY p.projectName
    `, {
      companyId,
      userId: currentUser.id
    });

    const projects = (result as any).recordset || result;
    return projects;
  } catch (error) {
    console.error('Ошибка при получении проектов для фильтра:', error);
    return [];
  }
}
