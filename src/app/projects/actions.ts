'use server';

import { query } from '@/db/connect';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/db/loginUser';

export interface Project {
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

// Получение проектов компаний текущего пользователя
export async function getProjects() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return [];
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
      LEFT JOIN [User] u ON p.userId = u.id
      WHERE p.companyId IN (
        -- Получаем компании, где текущий пользователь является сотрудником или владельцем
        SELECT DISTINCT companyId 
        FROM Employee 
        WHERE userId = @userId
        
        UNION
        
        SELECT id 
        FROM Company 
        WHERE ownerId = @userId
      )
      ORDER BY p.dtc DESC
    `, {
      userId: currentUser.id
    });

    const projects = (result as any).recordset || result;
    return projects;
  } catch (error) {
    console.error('Ошибка при получении проектов:', error);
    return [];
  }
}

// Получение проектов по компании
export async function getProjectsByCompany(companyId?: number) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return [];
    }

    // Если companyId не указан, возвращаем все проекты
    if (!companyId) {
      return await getProjects();
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
      LEFT JOIN [User] u ON p.userId = u.id
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
      ORDER BY p.dtc DESC
    `, {
      companyId,
      userId: currentUser.id
    });

    const projects = (result as any).recordset || result;
    return projects;
  } catch (error) {
    console.error('Ошибка при получении проектов по компании:', error);
    return [];
  }
}

// Получение компаний текущего пользователя
export async function getUserCompanies() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return [];
    }

    const result = await query(`
      SELECT DISTINCT c.id, c.companyName
      FROM Company c
      WHERE c.id IN (
        -- Компании, где пользователь является сотрудником
        SELECT DISTINCT companyId 
        FROM Employee 
        WHERE userId = @userId
        
        UNION
        
        -- Компании, где пользователь является владельцем
        SELECT id 
        FROM Company 
        WHERE ownerId = @userId
      )
      ORDER BY c.companyName
    `, {
      userId: currentUser.id
    });

    const companies = (result as any).recordset || result;
    return companies;
  } catch (error) {
    console.error('Ошибка при получении компаний:', error);
    return [];
  }
}

// Получение всех компаний для селектов
export async function getCompanies() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return [];
    }

    const result = await query(`
      SELECT c.id, c.companyName
      FROM Company c
      WHERE c.id IN (
        SELECT DISTINCT companyId 
        FROM Employee 
        WHERE userId = @userId
        
        UNION
        
        SELECT id 
        FROM Company 
        WHERE ownerId = @userId
      )
      ORDER BY c.companyName
    `, {
      userId: currentUser.id
    });

    const companies = (result as any).recordset || result;
    return companies;
  } catch (error) {
    console.error('Ошибка при получении компаний:', error);
    return [];
  }
}

// Получение проекта по ID
export async function getProjectById(id: number): Promise<Project | null> {
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
      LEFT JOIN [User] u ON p.userId = u.id
      WHERE p.id = @id
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
      id,
      userId: currentUser.id
    });

    const projects = (result as any).recordset || result;
    if (projects.length === 0) {
      return null;
    }

    return projects[0] as Project;
  } catch (error) {
    console.error('Ошибка при получении проекта:', error);
    return null;
  }
}

// Добавление проекта
export async function addProject(formData: FormData) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      redirect('/login');
    }

    const projectName = formData.get('projectName') as string;
    const description = formData.get('description') as string;
    const companyId = formData.get('companyId') as string;
    const statusSource = formData.get('statusSource') as string; // 'default' или templateId
    const templateId = statusSource && statusSource !== 'default' ? parseInt(statusSource) : null;

    if (!projectName || !companyId) {
      throw new Error('Необходимо заполнить обязательные поля');
    }

    // Получаем следующий ID
    const maxIdResult = await query(`SELECT ISNULL(MAX(id), 0) + 1 as nextId FROM Project`);
    const maxIdData = (maxIdResult as any).recordset || maxIdResult;
    const nextId = maxIdData[0].nextId;

    await query(`
      INSERT INTO Project (id, projectName, description, companyId, userId, dtc)
      VALUES (@id, @projectName, @description, @companyId, @userId, GETDATE())
    `, {
      id: nextId,
      projectName,
      description: description || null,
      companyId: parseInt(companyId),
      userId: currentUser.id
    });

    // Создаём статусы для проекта
    if (templateId) {
      // Из шаблона
      const { createProjectStatusesFromTemplate } = await import('./actions/statusActions');
      await createProjectStatusesFromTemplate(nextId, templateId);
    } else {
      // По умолчанию
      const { createProjectStatusesFromDefault } = await import('./actions/statusActions');
      await createProjectStatusesFromDefault(nextId);
    }

    redirect('/projects');
  } catch (error) {
    console.error('Ошибка при добавлении проекта:', error);
    throw error;
  }
}

// Обновление проекта
export async function updateProject(formData: FormData) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      redirect('/login');
    }

    const id = formData.get('id') as string;
    const projectName = formData.get('projectName') as string;
    const description = formData.get('description') as string;
    const companyId = formData.get('companyId') as string;

    if (!id || !projectName || !companyId) {
      throw new Error('Необходимо заполнить обязательные поля');
    }

    await query(`
      UPDATE Project
      SET 
        projectName = @projectName,
        description = @description,
        companyId = @companyId,
        dtu = GETDATE()
      WHERE id = @id
        AND companyId IN (
          SELECT DISTINCT companyId 
          FROM Employee 
          WHERE userId = @userId
          
          UNION
          
          SELECT id 
          FROM Company 
          WHERE ownerId = @userId
        )
    `, {
      id: parseInt(id),
      projectName,
      description: description || null,
      companyId: parseInt(companyId),
      userId: currentUser.id
    });

    redirect('/projects');
  } catch (error) {
    console.error('Ошибка при обновлении проекта:', error);
    throw error;
  }
}

// Удаление проекта
export async function deleteProject(id: number) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return { success: false, error: 'Пользователь не авторизован' };
    }

    await query(`
      DELETE FROM Project
      WHERE id = @id
        AND companyId IN (
          SELECT DISTINCT companyId 
          FROM Employee 
          WHERE userId = @userId
          
          UNION
          
          SELECT id 
          FROM Company 
          WHERE ownerId = @userId
        )
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
