'use server';

import { query } from '@/db/connect';
import { getCurrentUser } from '@/app/(auth)/actions/login';
import { revalidatePath } from 'next/cache';

export async function updateUserProfile(formData: FormData) {
  try {
    // Проверяем авторизацию
    const currentUser = await getCurrentUser();

    const userId = parseInt(formData.get('userId') as string);
    const nicName = formData.get('nicName') as string;
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const companyIdStr = formData.get('companyId') as string;
    const companyId = companyIdStr && companyIdStr !== '' ? parseInt(companyIdStr) : null;

    // Проверяем, что пользователь редактирует свой профиль
    if (currentUser.id !== userId) {
      return { success: false, error: 'Нет прав для редактирования этого профиля' };
    }

    // Валидация
    if (!nicName.trim()) {
      return { success: false, error: 'Никнейм обязателен для заполнения' };
    }

    // Проверяем уникальность никнейма (исключая текущего пользователя)
    const existingUser = await query(
      'SELECT id FROM [User] WHERE nicName = @nicName AND id != @userId',
      { nicName: nicName.trim(), userId }
    );

    if (existingUser.length > 0) {
      return { success: false, error: 'Пользователь с таким никнеймом уже существует' };
    }

    // Если выбрана компания, проверяем доступ к ней
    if (companyId) {
      const hasAccess = await query(`
        SELECT c.id 
        FROM Company c
        LEFT JOIN User_Company uc ON c.id = uc.companyId
        WHERE c.id = @companyId 
        AND (c.ownerId = @userId OR uc.userId = @userId)
      `, { companyId, userId });

      if (hasAccess.length === 0) {
        return { success: false, error: 'Нет доступа к выбранной компании' };
      }
    }

    // Обновляем профиль
    await query(`
      UPDATE [User] SET 
        nicName = @nicName,
        fullName = @fullName,
        email = @email,
        phone = @phone,
        companyId = @companyId
      WHERE id = @userId
    `, {
      userId,
      nicName: nicName.trim(),
      fullName: fullName.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      companyId: companyId
    });

    // Обновляем кеш для текущей страницы
    revalidatePath('/profile');
    revalidatePath('/dashboard');
    revalidatePath('/companies');
    revalidatePath('/'); // Обновляем layout с информацией о пользователе

    return { success: true };
  } catch (error) {
    console.error('Ошибка при обновлении профиля:', error);
    return { success: false, error: 'Произошла ошибка при обновлении профиля' };
  }
}
