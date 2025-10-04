'use server';

import { query } from '@/db/connect';
import { getCurrentUser } from '@/db/loginUser';

export async function getClientsByUserCompany() {
  const currentUser = await getCurrentUser();
  
  if (!currentUser?.companyId) {
    // Если пользователь не связан с компанией, возвращаем пустой список
    return [];
  }
  
  return await query(`
    SELECT c.*, comp.companyName 
    FROM Client c
    LEFT JOIN Company comp ON c.companyId = comp.id
    WHERE c.companyId = @companyId
    ORDER BY c.id DESC
  `, { companyId: currentUser.companyId });
}

export async function getClientsWithPagination(page: number = 1, pageSize: number = 10) {
  const offset = (page - 1) * pageSize;
  
  // Ограничиваем максимальный размер страницы для безопасности
  const safePageSize = Math.min(Math.max(pageSize, 5), 100);
  
  const currentUser = await getCurrentUser();
  
  if (!currentUser?.companyId) {
    // Если пользователь не связан с компанией, возвращаем пустой результат
    return {
      clients: [],
      pagination: {
        currentPage: page,
        pageSize: safePageSize,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      }
    };
  }
  
  const [clients, totalResult] = await Promise.all([
    query(`
      SELECT c.*, comp.companyName 
      FROM Client c
      LEFT JOIN Company comp ON c.companyId = comp.id
      WHERE c.companyId = @companyId
      ORDER BY c.id DESC 
      OFFSET @offset ROWS 
      FETCH NEXT @pageSize ROWS ONLY
    `, { companyId: currentUser.companyId, offset, pageSize: safePageSize }),
    query('SELECT COUNT(*) as total FROM Client WHERE companyId = @companyId', { companyId: currentUser.companyId })
  ]);

  const total = totalResult[0]?.total || 0;
  const totalPages = Math.ceil(total / safePageSize);

  return {
    clients,
    pagination: {
      currentPage: page,
      pageSize: safePageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
}

export type Status = {
  id: number;
  status: string;
};

export async function getStatuses(): Promise<Status[]> {
  return await query('SELECT id, status FROM Status ORDER BY status');
}

export async function deleteClient(id: number) {
  await query('DELETE FROM Client WHERE id = @id', { id });
}

export async function getTotalSum(companyId?: number): Promise<number> {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    return 0;
  }
  
  // Если companyId не указан или "all", получаем сумму по всем компаниям пользователя
  if (!companyId || companyId === 0) {
    const result = await query(`
      SELECT SUM(summa) as totalSum 
      FROM Client 
      WHERE summa IS NOT NULL AND companyId IN (
        SELECT DISTINCT id 
        FROM Company 
        WHERE ownerId = @userId
        UNION
        SELECT DISTINCT companyId 
        FROM User_Company 
        WHERE userId = @userId
      )
    `, { userId: currentUser.id });
    
    return result[0]?.totalSum || 0;
  }

  // Проверяем, что пользователь имеет доступ к указанной компании
  const hasAccess = await query(`
    SELECT 1 FROM (
      SELECT DISTINCT id
      FROM Company 
      WHERE ownerId = @userId
      UNION
      SELECT DISTINCT companyId as id
      FROM User_Company 
      WHERE userId = @userId
    ) AS userCompanies
    WHERE id = @companyId
  `, { userId: currentUser.id, companyId });

  if (hasAccess.length === 0) {
    return 0;
  }

  const result = await query(`
    SELECT SUM(summa) as totalSum 
    FROM Client 
    WHERE summa IS NOT NULL AND companyId = @companyId
  `, { companyId });
  
  return result[0]?.totalSum || 0;
}

export type AddClientParams = {
  clientName: string;
  description?: string;
  contacts?: string;
  statusId: number;
  summa?: number;
  payDate?: string;
  payType?: string;
  companyId: number;
};

export async function addClient(params: AddClientParams) {
  const sql = `INSERT INTO Client (clientName, description, contacts, statusId, summa, payDate, payType, companyId)
    VALUES (@clientName, @description, @contacts, @statusId, @summa, @payDate, @payType, @companyId)`;
  await query(sql, params);
}

export type UpdateClientParams = {
  id: number;
  clientName?: string;
  description?: string;
  contacts?: string;
  statusId?: number;
  summa?: number;
  payDate?: string;
  payType?: string;
  companyId?: number;
};

export async function updateClient(params: UpdateClientParams) {
  const fields = Object.keys(params).filter(key => key !== 'id');
  const setClause = fields.map(key => `${key} = @${key}`).join(', ');
  const sql = `UPDATE Client SET ${setClause} WHERE id = @id`;
  await query(sql, params);
}

export async function getUserCompanies() {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    return [];
  }
  
  // Получаем компании, где пользователь является сотрудником или владельцем
  const companies = await query(`
    SELECT DISTINCT c.id, c.companyName
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
  
  return companies;
}

export async function getClientsByCompany(companyId?: number) {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    return [];
  }

  // Если companyId не указан или "all", получаем клиентов всех компаний пользователя
  if (!companyId || companyId === 0) {
    return await query(`
      SELECT c.*, comp.companyName 
      FROM Client c
      LEFT JOIN Company comp ON c.companyId = comp.id
      WHERE c.companyId IN (
        -- Компании, где пользователь владелец
        SELECT DISTINCT id 
        FROM Company 
        WHERE ownerId = @userId
        UNION
        -- Компании из User_Company
        SELECT DISTINCT companyId 
        FROM User_Company 
        WHERE userId = @userId
      )
      ORDER BY c.id DESC
    `, { userId: currentUser.id });
  }

  // Проверяем, что пользователь имеет доступ к указанной компании
  // (владелец или в User_Company)
  const hasAccess = await query(`
    SELECT 1 FROM (
      SELECT DISTINCT id
      FROM Company 
      WHERE ownerId = @userId
      UNION
      SELECT DISTINCT companyId as id
      FROM User_Company 
      WHERE userId = @userId
    ) AS userCompanies
    WHERE id = @companyId
  `, { userId: currentUser.id, companyId });

  if (hasAccess.length === 0) {
    return [];
  }

  return await query(`
    SELECT c.*, comp.companyName 
    FROM Client c
    LEFT JOIN Company comp ON c.companyId = comp.id
    WHERE c.companyId = @companyId
    ORDER BY c.id DESC
  `, { companyId });
}