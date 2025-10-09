'use server'

import { query } from '@/db/connect'
import { getCurrentUser } from '@/app/(auth)/actions/login'

export interface UserCompany {
  id: number
  companyName: string
  isOwner: boolean
}

export async function getUserCompanies(): Promise<UserCompany[]> {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    throw new Error('Пользователь не авторизован')
  }

  try {
    const companies = await query(`
      SELECT DISTINCT
        c.id,
        c.companyName,
        access_info.accessTypes,
        access_info.roleDescription,
        CASE WHEN c.ownerId = @userId THEN 1 ELSE 0 END as isOwner,
        CASE WHEN c.id = @primaryCompanyId THEN 1 ELSE 0 END as isPrimary,
        access_info.priority
      FROM Company c
      JOIN (
        -- Собираем все типы доступа для каждой компании
        SELECT 
          companyId,
          STRING_AGG(accessType, ', ') as accessTypes,
          STRING_AGG(roleDescription, ', ') as roleDescription,
          MIN(priority) as priority
        FROM (
          -- User_Company связи
          SELECT 
            uc.companyId,
            'user_company' as accessType,
            'Участник' as roleDescription,
            2 as priority
          FROM User_Company uc 
          WHERE uc.userId = @userId
          
          UNION ALL
          
          -- Employee связи (пользователь-сотрудник) - ЭТО ОТСУТСТВОВАЛО!
          SELECT 
            e.companyId,
            'employee' as accessType,
            'Сотрудник' as roleDescription,
            3 as priority
          FROM Employee e 
          WHERE e.userId = @userId AND e.userId IS NOT NULL
          
          UNION ALL
          
          -- Основная компания
          SELECT 
            u.companyId,
            'primary' as accessType,
            'Основная' as roleDescription,
            4 as priority
          FROM [User] u 
          WHERE u.id = @userId AND u.companyId IS NOT NULL
          
          UNION ALL
          
          -- Владение компанией
          SELECT 
            c.id as companyId,
            'owner' as accessType,
            'Владелец' as roleDescription,
            1 as priority
          FROM Company c
          WHERE c.ownerId = @userId
        ) AS all_access
        GROUP BY companyId
      ) AS access_info ON c.id = access_info.companyId
      ORDER BY 
        access_info.priority ASC, -- Владельцы первыми
        isPrimary DESC, 
        c.companyName
    `, { 
      userId: currentUser.id,
      primaryCompanyId: currentUser.companyId 
    });

    return companies.map((company: any) => ({
      id: company.id,
      companyName: company.companyName,
      isOwner: Boolean(company.isOwner)
    }))
  } catch (error) {
    console.error('Ошибка при получении компаний пользователя:', error)
    throw new Error('Не удалось получить список компаний')
  }
}
