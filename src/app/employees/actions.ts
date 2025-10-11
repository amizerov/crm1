'use server';

import { query } from '@/db/connect';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/(auth)/actions/login';

export interface Employee {
  id: number;
  Name: string;
  companyId: number;
  userId?: number;
  companyName?: string;
  userNicName?: string;
  userFullName?: string;
  displayName: string; // Добавляем поле для отображения
  dtc: string; // дата создания
  dtu?: string; // дата обновления
}

// Получение сотрудников всех компаний текущего пользователя
export async function getEmployees() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return [];
    }

    const result = await query(`
      SELECT 
        e.id,
        e.Name,
        e.companyId,
        e.userId,
        c.companyName,
        u.nicName as userNicName,
        u.fullName as userFullName,
        -- Показываем связь с пользователем
        CASE 
          WHEN e.userId IS NOT NULL THEN e.Name + ' (' + COALESCE(u.nicName, u.fullName, 'Пользователь') + ')'
          ELSE e.Name + ' (только сотрудник)'
        END as displayName,
        e.dtc,
        e.dtu
      FROM Employee e
      LEFT JOIN Company c ON e.companyId = c.id
      LEFT JOIN [User] u ON e.userId = u.id
      WHERE e.companyId IN (
        -- Получаем компании, где текущий пользователь является сотрудником или владельцем
        SELECT DISTINCT companyId 
        FROM Employee 
        WHERE userId = @userId
        UNION
        SELECT DISTINCT id 
        FROM Company 
        WHERE ownerId = @userId
      )
      ORDER BY e.Name
    `, { userId: currentUser.id });

    const employees = (result as any).recordset || result;
    return employees;

  } catch (error) {
    console.error('Ошибка получения сотрудников:', error);
    return [];
  }
}

// Получение сотрудников по конкретной компании или всех компаний пользователя
export async function getEmployeesByCompany(companyId?: number) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return [];
    }

    // Если companyId не указан или "all", получаем сотрудников всех компаний пользователя
    if (!companyId || companyId === 0) {
      return await getEmployees();
    }

    // Проверяем, что пользователь имеет доступ к указанной компании
    const hasAccess = await query(`
      SELECT 1 FROM (
        SELECT DISTINCT companyId as id
        FROM Employee 
        WHERE userId = @userId
        UNION
        SELECT DISTINCT id 
        FROM Company 
        WHERE ownerId = @userId
      ) AS userCompanies
      WHERE id = @companyId
    `, { userId: currentUser.id, companyId });

    if (hasAccess.length === 0) {
      return [];
    }

    const result = await query(`
      -- Получаем сотрудников компании
      SELECT 
        e.id,
        e.Name,
        e.companyId,
        e.userId,
        c.companyName,
        u.nicName as userNicName,
        u.fullName as userFullName,
        -- Показываем связь с пользователем
        CASE 
          WHEN e.userId IS NOT NULL THEN e.Name + ' (' + COALESCE(u.nicName, u.fullName, 'Пользователь') + ')'
          ELSE e.Name + ' (только сотрудник)'
        END as displayName,
        e.dtc
      FROM Employee e
      LEFT JOIN Company c ON e.companyId = c.id
      LEFT JOIN [User] u ON e.userId = u.id
      WHERE e.companyId = @companyId

      UNION

      -- Добавляем пользователей из User_Company, которых нет в Employee
      SELECT 
        uc.userId as id, -- Отрицательный ID для пользователей из User_Company
        COALESCE(u.nicName, u.fullName, u.login) as Name,
        uc.companyId,
        uc.userId,
        c.companyName,
        u.nicName as userNicName,
        u.fullName as userFullName,
        COALESCE(u.nicName, u.fullName, u.login) as displayName,
        u.dtc
      FROM User_Company uc
      INNER JOIN [User] u ON uc.userId = u.id
      INNER JOIN Company c ON uc.companyId = c.id
      WHERE uc.companyId = @companyId
      AND NOT EXISTS (
        SELECT 1 FROM Employee e 
        WHERE e.companyId = uc.companyId AND e.userId = uc.userId
      )

      ORDER BY Name
    `, { companyId });

    const employees = (result as any).recordset || result;
    return employees;

  } catch (error) {
    console.error('Ошибка получения сотрудников по компании:', error);
    return [];
  }
}

// Получение сотрудника по ID (с проверкой доступа)
export async function getEmployeeById(id: number): Promise<Employee | null> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return null;
    }

    const result = await query(`
      SELECT 
        e.id,
        e.userId,
        e.Name,
        e.companyId,
        e.dtc,
        e.dtu,
        c.companyName
      FROM Employee e
      LEFT JOIN Company c ON e.companyId = c.id
      WHERE e.id = @id AND e.companyId IN (
        SELECT DISTINCT companyId 
        FROM Employee 
        WHERE userId = @userId
        UNION
        SELECT DISTINCT id 
        FROM Company 
        WHERE ownerId = @userId
      )
    `, { id, userId: currentUser.id });
    
    return result[0] || null;
  } catch (error) {
    console.error('Ошибка в getEmployeeById:', error);
    return null;
  }
}

// Добавление сотрудника
export async function addEmployee(formData: FormData) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error('Пользователь не авторизован');
    }

    const params = {
      Name: (formData.get('Name') as string)?.trim(),
      userId: formData.get('userId') ? Number(formData.get('userId')) : null,
      companyId: formData.get('companyId') ? Number(formData.get('companyId')) : null,
    };

    if (!params.Name) {
      throw new Error('Имя сотрудника обязательно');
    }

    if (!params.companyId) {
      throw new Error('Компания обязательна');
    }

    // Проверяем, что пользователь имеет доступ к указанной компании
    const hasAccess = await query(`
      SELECT 1 FROM (
        SELECT DISTINCT companyId as id
        FROM Employee 
        WHERE userId = @userId
        UNION
        SELECT DISTINCT id 
        FROM Company 
        WHERE ownerId = @userId
      ) AS userCompanies
      WHERE id = @companyId
    `, { userId: currentUser.id, companyId: params.companyId });

    if (hasAccess.length === 0) {
      throw new Error('У вас нет доступа к этой компании');
    }

    // Обрабатываем пустые строки как null
    if (formData.get('userId') === '') {
      params.userId = null;
    }

    const sql = `INSERT INTO Employee (Name, userId, companyId, dtc)
      VALUES (@Name, @userId, @companyId, GETDATE())`;
    await query(sql, params);
  } catch (error) {
    console.error('Ошибка в addEmployee:', error);
    throw new Error('Не удалось добавить сотрудника');
  }
  
  // redirect вызываем ВНЕ try-catch блока
  redirect('/employees');
}

// Обновление сотрудника
export type UpdateEmployeeParams = {
  id: number;
  Name?: string;
  userId?: number;
  companyId?: number;
};

export async function updateEmployee(params: UpdateEmployeeParams) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error('Пользователь не авторизован');
    }

    // Сначала проверим, что сотрудник принадлежит к компании пользователя
    const employeeCheck = await query(`
      SELECT e.id, e.companyId 
      FROM Employee e
      WHERE e.id = @id AND e.companyId IN (
        SELECT DISTINCT companyId 
        FROM Employee 
        WHERE userId = @userId
        UNION
        SELECT DISTINCT id 
        FROM Company 
        WHERE ownerId = @userId
      )
    `, { id: params.id, userId: currentUser.id });

    if (employeeCheck.length === 0) {
      throw new Error('У вас нет доступа к этому сотруднику');
    }

    // Создаем объект с только непустыми полями
    const updateFields: any = {};
    
    if (params.Name && params.Name.trim() !== '') {
      updateFields.Name = params.Name.trim();
    }
    
    // Для userId разрешаем null (сброс связи)
    if (params.userId !== undefined) {
      updateFields.userId = params.userId || null;
    }
    
    // Если изменяется companyId, проверяем доступ к новой компании
    if (params.companyId !== undefined) {
      if (params.companyId) {
        const hasAccess = await query(`
          SELECT 1 FROM (
            SELECT DISTINCT companyId as id
            FROM Employee 
            WHERE userId = @userId
            UNION
            SELECT DISTINCT id 
            FROM Company 
            WHERE ownerId = @userId
          ) AS userCompanies
          WHERE id = @companyId
        `, { userId: currentUser.id, companyId: params.companyId });

        if (hasAccess.length === 0) {
          throw new Error('У вас нет доступа к указанной компании');
        }
      }
      updateFields.companyId = params.companyId || null;
    }
    
    // Проверяем, есть ли что обновлять
    const fields = Object.keys(updateFields).filter(key => key !== 'id');
    
    if (fields.length === 0) {
      throw new Error('Нет данных для обновления');
    }
    
    const setClause = fields.map(key => `${key} = @${key}`).join(', ');
    const sql = `UPDATE Employee SET ${setClause}, dtu = GETDATE() WHERE id = @id`;
    
    const queryParams = { ...updateFields, id: params.id };
    
    await query(sql, queryParams);
  } catch (error) {
    console.error('Ошибка в updateEmployee:', error);
    throw new Error(`Не удалось обновить сотрудника: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  // redirect вызываем ВНЕ try-catch блока
  redirect('/employees');
}

// Получение списка пользователей для связи
export async function getUsers(): Promise<{id: number, login: string, nicName: string}[]> {
  try {
    const result = await query(`
      SELECT 
        id,
        login,
        nicName
      FROM [User]
      ORDER BY nicName
    `);
    
    return result;
  } catch (error) {
    console.error('Ошибка в getUsers:', error);
    return [];
  }
}

// Получение списка компаний пользователя для связи
export async function getCompanies(): Promise<{id: number, companyName: string}[]> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return [];
    }

    const result = await query(`
      SELECT 
        c.id,
        c.companyName
      FROM Company c
      WHERE c.id IN (
        SELECT DISTINCT companyId 
        FROM Employee 
        WHERE userId = @userId
        UNION
        SELECT DISTINCT id 
        FROM Company 
        WHERE ownerId = @userId
      )
      ORDER BY c.companyName
    `, { userId: currentUser.id });
    
    return result;
  } catch (error) {
    console.error('Ошибка в getCompanies:', error);
    return [];
  }
}

// Получение компаний пользователя для селектора
export async function getUserCompanies() {
  return await getCompanies();
}
