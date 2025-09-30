'use server';

import { query } from './connect';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginUser(formData: FormData) {
  const login = formData.get('login') as string;
  const password = formData.get('password') as string;
  const returnTo = formData.get('returnTo') as string;

  if (!login || !password) {
    throw new Error('Логин и пароль обязательны');
  }

  try {
    console.log('Попытка входа для пользователя:', login);
    
    // Сначала проверим, есть ли пользователи в таблице вообще
    const allUsersResult = await query('SELECT COUNT(*) as count FROM [User]');
    console.log('Всего пользователей в таблице:', allUsersResult[0].count);
    
    // Если пользователей нет, создадим тестового пользователя admin
    if (allUsersResult[0].count === 0) {
      console.log('Создаем тестового пользователя admin...');
      await query(`
        INSERT INTO [User] (login, nicName, password)
        VALUES (@login, @nicName, @password)
      `, {
        login: 'admin',
        nicName: 'Администратор',
        password: 'admin'
      });
      console.log('Тестовый пользователь admin создан');
    }
    
    // Проверим, есть ли пользователь с таким логином
    const userExistsResult = await query('SELECT id, login, nicName FROM [User] WHERE login = @login', { login });
    
    console.log('Пользователь с логином', login, 'найден:', userExistsResult.length > 0);
    
    const result = await query(`
      SELECT id, login, nicName 
      FROM [User] 
      WHERE login = @login AND password = @password
    `, { login, password });

    console.log('Результат авторизации:', result.length);

    if (result.length === 0) {
      throw new Error('Неверный логин или пароль');
    }

    const user = result[0];
    
    // Сохраняем данные пользователя в cookies (сессии)
    const cookieStore = await cookies();
    cookieStore.set('userId', user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 дней
    });
    cookieStore.set('userNicName', user.nicName, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 дней
    });
    console.log('Пользователь успешно авторизован:', user.nicName);
    
  } catch (error) {
    console.error('Ошибка при авторизации:', error);
    throw error;
  }
  
  // Перенаправляем на дашборд после успешного логина
  redirect('/dashboard');
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('userId');
  cookieStore.delete('userNicName');
  redirect('/login');
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  const userNicName = cookieStore.get('userNicName')?.value;
  
  if (!userId) {
    return null;
  }
  
  try {
    const result = await query(`
      SELECT 
        u.id, 
        u.login, 
        u.nicName, 
        u.fullName, 
        u.email, 
        u.phone,
        u.companyId,
        c.companyName,
        CASE 
          WHEN c.ownerId = u.id THEN 1 
          ELSE 0 
        END as isOwner
      FROM [User] u
      LEFT JOIN Company c ON u.companyId = c.id
      WHERE u.id = @userId
    `, { userId: parseInt(userId) });
    
    if (result.length === 0) {
      // Fallback - используем данные из кукисов
      return {
        id: parseInt(userId),
        nicName: userNicName || 'Пользователь',
        login: '',
        fullName: null,
        email: null,
        phone: null,
        companyId: null,
        companyName: null,
        isOwner: false
      };
    }
    
    const userData = result[0];
    return {
      ...userData,
      isOwner: Boolean(userData.isOwner) // Преобразуем 0/1 в false/true
    };
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
    // Fallback - используем данные из кукисов
    return {
      id: parseInt(userId),
      nicName: userNicName || 'Пользователь',
      login: '',
      fullName: null,
      email: null,
      phone: null,
      companyId: null,
      companyName: null,
      isOwner: false
    };
  }
}
