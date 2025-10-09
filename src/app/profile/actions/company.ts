'use server';

import { query } from '@/db/connect';
import { getCurrentUser } from '@/app/(auth)/actions/login';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function createCompany(formData: FormData) {
  try {
    // Проверяем авторизацию
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      redirect('/login');
    }

    const companyName = formData.get('companyName') as string;
    const description = formData.get('description') as string;

    // Валидация
    if (!companyName.trim()) {
      return { success: false, error: 'Название компании обязательно для заполнения' };
    }

    // Проверяем уникальность названия компании
    const existingCompany = await query(
      'SELECT id FROM Company WHERE companyName = @companyName',
      { companyName: companyName.trim() }
    );

    if (existingCompany.length > 0) {
      return { success: false, error: 'Компания с таким названием уже существует' };
    }

    // Создаем новую компанию
    const result = await query(`
      INSERT INTO Company (companyName, description, ownerId)
      OUTPUT INSERTED.id
      VALUES (@companyName, @description, @ownerId)
    `, {
      companyName: companyName.trim(),
      description: description.trim() || null,
      ownerId: currentUser.id
    });

    const newCompanyId = result[0].id;

    // Обновляем кеш
    revalidatePath('/profile');
    revalidatePath('/');

    return { success: true, companyId: newCompanyId };
  } catch (error) {
    console.error('Ошибка при создании компании:', error);
    return { success: false, error: 'Произошла ошибка при создании компании' };
  }
}

export async function switchUserCompany(formData: FormData) {
  try {
    // Проверяем авторизацию
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      redirect('/login');
    }

    const companyIdStr = formData.get('companyId') as string;
    const companyId = companyIdStr && companyIdStr !== '' ? parseInt(companyIdStr) : null;

    // Если выбрали компанию, проверяем права доступа
    if (companyId) {
      const hasAccess = await query(`
        SELECT 1 FROM Company 
        WHERE id = @companyId AND (
          ownerId = @userId OR 
          id IN (SELECT companyId FROM [User] WHERE id = @userId AND companyId = @companyId)
        )
      `, { companyId, userId: currentUser.id });

      if (hasAccess.length === 0) {
        return { success: false, error: 'Нет доступа к выбранной компании' };
      }
    }

    // Обновляем компанию пользователя
    await query(`
      UPDATE [User] SET 
        companyId = @companyId
      WHERE id = @userId
    `, {
      userId: currentUser.id,
      companyId
    });

    // Обновляем кеш
    revalidatePath('/profile');
    revalidatePath('/dashboard');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Ошибка при переключении компании:', error);
    return { success: false, error: 'Произошла ошибка при переключении компании' };
  }
}

