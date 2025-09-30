import { query } from '@/db/connect';

export async function getClients() {
  return await query('SELECT * FROM Client ORDER BY id DESC');
}

export async function getClientsWithPagination(page: number = 1, pageSize: number = 10) {
  const offset = (page - 1) * pageSize;
  
  // Ограничиваем максимальный размер страницы для безопасности
  const safePageSize = Math.min(Math.max(pageSize, 5), 100);
  
  const [clients, totalResult] = await Promise.all([
    query(`
      SELECT * FROM Client 
      ORDER BY id DESC 
      OFFSET @offset ROWS 
      FETCH NEXT @pageSize ROWS ONLY
    `, { offset, pageSize: safePageSize }),
    query('SELECT COUNT(*) as total FROM Client')
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

export async function getTotalSum(): Promise<number> {
  const result = await query('SELECT SUM(summa) as totalSum FROM Client WHERE summa IS NOT NULL');
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
};

export async function addClient(params: AddClientParams) {
  const sql = `INSERT INTO Client (clientName, description, contacts, statusId, summa, payDate, payType)
    VALUES (@clientName, @description, @contacts, @statusId, @summa, @payDate, @payType)`;
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
};

export async function updateClient(params: UpdateClientParams) {
  const fields = Object.keys(params).filter(key => key !== 'id');
  const setClause = fields.map(key => `${key} = @${key}`).join(', ');
  const sql = `UPDATE Client SET ${setClause} WHERE id = @id`;
  await query(sql, params);
}