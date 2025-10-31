'use server';

import { query } from '@/db/connect';
import { getCurrentUser } from '@/app/(auth)/actions/login';

export interface ProjectDetails {
  id: number;
  projectName: string;
  description?: string;
  companyId: number;
  userId: number;
  companyName?: string;
  userNicName?: string;
  userFullName?: string;
  dtc: string;
  dtu?: string;
}

// Получение деталей проекта
export async function getProjectDetails(projectId: number): Promise<ProjectDetails | null> {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return null;
    }

    const result = await query(`
      SELECT 
        p.id,
        p.projectName,
        p.description,
        p.companyId,
        p.userId,
        c.companyName,
        u.nicName as userNicName,
        u.fullName as userFullName,
        p.dtc,
        p.dtu
      FROM Project p
      LEFT JOIN Company c ON p.companyId = c.id
      LEFT JOIN [Users] u ON p.userId = u.id
      WHERE p.id = @projectId
        AND p.companyId IN (
          SELECT DISTINCT companyId 
          FROM Employee 
          WHERE userId = @userId
          
          UNION
          
          SELECT id 
          FROM Company 
          WHERE ownerId = @userId
        )
    `, {
      projectId,
      userId: currentUser.id
    });

    const projects = (result as any).recordset || result;
    if (projects.length === 0) {
      return null;
    }

    return projects[0] as ProjectDetails;
  } catch (error) {
    console.error('Ошибка при получении деталей проекта:', error);
    return null;
  }
}