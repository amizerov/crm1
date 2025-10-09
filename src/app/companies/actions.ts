'use server';

import { query } from '@/db/connect';
import { getCurrentUser } from '@/app/(auth)/actions/login';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function switchCompany(formData: FormData) {
  try {
    // Проверяем авторизацию
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      redirect('/login');
    }

    const companyId = parseInt(formData.get('companyId') as string);
    
    if (isNaN(companyId)) {
      throw new Error('Неверный ID компании');
    }

    // Проверяем, что пользователь имеет доступ к этой компании
    const accessCheck = await query(`
      SELECT c.id 
      FROM Company c
      LEFT JOIN User_Company uc ON c.id = uc.companyId
      WHERE c.id = @companyId 
      AND (c.ownerId = @userId OR uc.userId = @userId)
    `, {
      companyId,
      userId: currentUser.id
    });

    if (accessCheck.length === 0) {
      throw new Error('Нет доступа к этой компании');
    }

    // Обновляем активную компанию пользователя
    await query(`
      UPDATE [User] SET companyId = @companyId WHERE id = @userId
    `, {
      companyId,
      userId: currentUser.id
    });

    // Обновляем кеш
    revalidatePath('/companies');
    revalidatePath('/profile');
    revalidatePath('/dashboard');
    revalidatePath('/');

  } catch (error) {
    console.error('Ошибка при переключении компании:', error);
    throw error;
  }
}
