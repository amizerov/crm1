'use server';

import { redirect } from 'next/navigation';
import { query } from '@/db/connect';
import { getCurrentUser } from '@/app/(auth)/actions/login';

export interface ProjectAccessEmployee {
  id: number;
  name: string;
  displayName: string;
  hasAccess: boolean;
}

function getRows(result: any) {
  return result?.recordset || result || [];
}

export async function deleteProject(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return { success: false, error: 'Пользователь не авторизован' };
    }

    // Проверяем, есть ли задачи в этом проекте
    const tasksResult = await query(`
      SELECT COUNT(*) as taskCount
      FROM Task
      WHERE projectId = @projectId
    `, {
      projectId: id
    });

    const taskCount = (tasksResult as any)[0]?.taskCount || 0;

    if (taskCount > 0) {
      return { 
        success: false, 
        error: `Невозможно удалить проект. В проекте есть задачи (${taskCount} шт.). Сначала удалите все задачи проекта.` 
      };
    }

    // Удаляем проект только если пользователь его создал
    await query(`
      delete StatusTask where projectId = @id;
      
      DELETE FROM Project
      WHERE id = @id
        AND userId = @userId
    `, {
      id,
      userId: currentUser.id
    });

    return { success: true };

  } catch (error) {
    console.error('Ошибка при удалении проекта:', error);
    return { success: false, error: 'Ошибка при удалении проекта' };
  }
}

export async function getProjectAccessEmployees(projectId: number): Promise<ProjectAccessEmployee[]> {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return [];
    }

    const result = await query(`
      SELECT
        e.id,
        e.Name as name,
        CASE
          WHEN e.userId IS NOT NULL THEN e.Name + ' (' + COALESCE(u.nicName, u.fullName, u.login, 'Пользователь') + ')'
          ELSE e.Name
        END as displayName,
        CASE WHEN pe.id IS NULL THEN CAST(0 AS bit) ELSE CAST(1 AS bit) END as hasAccess
      FROM Project p
      INNER JOIN Employee e ON e.companyId = p.companyId
      LEFT JOIN [Users] u ON e.userId = u.id
      LEFT JOIN Project_Employee pe ON pe.projectId = p.id AND pe.employeeId = e.id
      WHERE p.id = @projectId
        AND p.companyId IN (
          SELECT DISTINCT companyId
          FROM Employee
          WHERE userId = @userId
          UNION
          SELECT DISTINCT id
          FROM Company
          WHERE ownerId = @userId
        )
      ORDER BY e.Name
    `, {
      projectId,
      userId: currentUser.id,
    });

    return getRows(result).map((employee: any) => ({
      id: employee.id,
      name: employee.name,
      displayName: employee.displayName || employee.name,
      hasAccess: Boolean(employee.hasAccess),
    }));
  } catch (error) {
    console.error('Ошибка при получении доступов проекта:', error);
    return [];
  }
}

export async function updateProjectAccess(
  projectId: number,
  employeeIds: number[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return { success: false, error: 'Пользователь не авторизован' };
    }

    const accessCheck = await query(`
      SELECT p.id
      FROM Project p
      WHERE p.id = @projectId
        AND p.companyId IN (
          SELECT DISTINCT companyId
          FROM Employee
          WHERE userId = @userId
          UNION
          SELECT DISTINCT id
          FROM Company
          WHERE ownerId = @userId
        )
    `, {
      projectId,
      userId: currentUser.id,
    });

    if (getRows(accessCheck).length === 0) {
      return { success: false, error: 'Нет доступа к проекту' };
    }

    const validEmployeesResult = await query(`
      SELECT e.id
      FROM Employee e
      INNER JOIN Project p ON p.companyId = e.companyId
      WHERE p.id = @projectId
    `, { projectId });

    const validEmployeeIds = new Set(getRows(validEmployeesResult).map((employee: any) => Number(employee.id)));
    const nextEmployeeIds = Array.from(new Set(employeeIds.map(Number)))
      .filter((employeeId) => validEmployeeIds.has(employeeId));

    await query(`
      DELETE FROM Project_Employee
      WHERE projectId = @projectId
    `, { projectId });

    for (const employeeId of nextEmployeeIds) {
      await query(`
        INSERT INTO Project_Employee (projectId, employeeId, dtc)
        VALUES (@projectId, @employeeId, GETDATE())
      `, {
        projectId,
        employeeId,
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Ошибка при обновлении доступов проекта:', error);
    return { success: false, error: 'Не удалось обновить доступы проекта' };
  }
}
