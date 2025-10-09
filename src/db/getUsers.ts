import { query } from './connect';

type User = {
  id: number;
  login: string;
  nicName: string;
  password: string;
};

export async function getUsers(): Promise<User[]> {
  try {
    const result = await query(`
      SELECT id, login, nicName, password
      FROM [User]
      ORDER BY nicName
    `);
    
    return result as User[];
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error);
    throw new Error('Не удалось получить список пользователей');
  }
}

// Получить все компании, где пользователь является владельцем или сотрудником
export async function getUserCompanies(userId: number) {
  try {
    const companies = await query(`
    SELECT DISTINCT 
      c.id, 
      c.companyName, 
      c.ownerId,
      u.fullName as ownerName,
      CASE WHEN c.ownerId = @userId THEN 1 ELSE 0 END as isOwner
    FROM Company c
    LEFT JOIN [User] u ON c.ownerId = u.id
    WHERE c.id IN (
      -- Компании, где пользователь владелец
      SELECT DISTINCT id 
      FROM Company 
      WHERE ownerId = @userId
      UNION
      -- Компании из User_Company
      SELECT DISTINCT companyId 
      FROM User_Company 
      WHERE userId = @userId
      UNION
      -- Компании, где пользователь сотрудник
      SELECT DISTINCT companyId
      FROM Employee
      WHERE userId = @userId
    )
    ORDER BY c.companyName
    `, { userId });
    
    return companies;
  } catch (error) {
    console.error('Ошибка при получении компаний пользователя:', error);
    return [];
  }
}