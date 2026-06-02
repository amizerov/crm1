'use server';

import { query } from '@/db/connect';
import { getCurrentUser } from '@/app/(auth)/actions/login';

export interface Project {
  id: number;
  projectName: string;
}

export async function getProjectsByCompanyForFilter(companyId?: number): Promise<Project[]> {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !companyId) {
      return [];
    }

    const result = await query(`
      SELECT
        p.id,
        p.projectName
      FROM Project p
      WHERE p.companyId = @companyId
        AND (
          EXISTS (
            SELECT 1
            FROM Company c
            WHERE c.id = p.companyId
              AND c.ownerId = @userId
          )
          OR EXISTS (
            SELECT 1
            FROM Project_Employee pe
            INNER JOIN Employee e ON e.id = pe.employeeId
            WHERE pe.projectId = p.id
              AND e.companyId = p.companyId
              AND e.userId = @userId
          )
        )
      ORDER BY p.projectName
    `, {
      companyId,
      userId: currentUser.id
    });

    return (result as any).recordset || result;
  } catch (error) {
    console.error('Ошибка при получении проектов для фильтра:', error);
    return [];
  }
}
