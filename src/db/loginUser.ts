'use server';

import { query } from './connect';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

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
    
    // Проверим, есть ли пользователь с таким логином (получаем сразу все нужные поля)
    const userExistsResult = await query(`
      SELECT id, login, nicName, password, isVerified 
      FROM [User] 
      WHERE login = @login
    `, { login });
    
    console.log('Пользователь с логином', login, 'найден:', userExistsResult.length > 0);
    
    if (userExistsResult.length === 0) {
      throw new Error('Неверный логин или пароль');
    }

    const foundUser = userExistsResult[0];
    const storedPassword = foundUser.password;
    const isVerified = foundUser.isVerified;
    
    console.log('🔍 Данные пользователя:', {
      id: foundUser.id,
      login: foundUser.login,
      hashedPassword: storedPassword?.startsWith('$2b$') || storedPassword?.startsWith('$2a$'),
      isVerified: isVerified
    });

    let isPasswordValid = false;

    // Проверяем, является ли пароль хешем bcrypt (начинается с $2b$ или $2a$)
    if (storedPassword && (storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2a$'))) {
      // Новый пользователь с хешированным паролем
      console.log('✅ Проверка хешированного пароля');
      isPasswordValid = await bcrypt.compare(password, storedPassword);
    } else {
      // Старый пользователь с паролем в открытом виде
      console.log('⚠️ Проверка пароля в открытом виде (старый пользователь)');
      isPasswordValid = password === storedPassword;
    }

    if (!isPasswordValid) {
      throw new Error('Неверный логин или пароль');
    }

    // Проверяем подтверждение email
    // Для пользователей с хешированным паролем (новые через регистрацию) - ОБЯЗАТЕЛЬНАЯ проверка
    if (storedPassword && (storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2a$'))) {
      console.log('🔐 Проверка подтверждения email для нового пользователя, isVerified:', isVerified);
      
      // Проверяем: isVerified должен быть 1 или true (иначе отказ)
      if (isVerified === 0 || isVerified === false || isVerified === null || isVerified === undefined) {
        console.log('❌ Email не подтвержден! Отказано в доступе.');
        throw new Error('Пожалуйста, подтвердите ваш email перед входом. Проверьте почту.');
      }
      console.log('✅ Email подтвержден, доступ разрешен');
    } else {
      // Старый пользователь - проверяем только если поле isVerified существует и равно 0
      console.log('⚠️ Старый пользователь (пароль в открытом виде), isVerified:', isVerified);
      if (isVerified === 0 || isVerified === false) {
        console.log('❌ Email не подтвержден у старого пользователя');
        throw new Error('Пожалуйста, подтвердите ваш email перед входом. Проверьте почту.');
      }
    }

    const user = foundUser;
    
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
    
    // Возвращаем успешный результат
    return { success: true, redirectTo: returnTo || '/dashboard' };
    
  } catch (error) {
    console.error('Ошибка при авторизации:', error);
    throw error;
  }
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
