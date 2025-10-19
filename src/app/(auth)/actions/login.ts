'use server';

import { query } from '@/db/connect';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

/**
 * Хеширование пароля с помощью bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Server Action для входа пользователя
 * Поддерживает легаси-пользователей с паролем "123" в открытом виде
 * и новых пользователей с хешированными паролями
 */
export async function loginAction(formData: FormData) {
  const login = formData.get('login') as string;
  const password = formData.get('password') as string;
  const returnTo = formData.get('returnTo') as string;

  if (!login || !password) {
    return { 
      success: false, 
      error: 'Логин и пароль обязательны' 
    };
  }

  try {
    console.log('🔐 Попытка входа для пользователя:', login);
    
    // Получаем пользователя из БД
    const userResult = await query(`
      SELECT id, login, nicName, password, isVerified 
      FROM [Users] 
      WHERE login = @login
    `, { login });
    
    if (userResult.length === 0) {
      console.log('❌ Пользователь не найден');
      return { 
        success: false, 
        error: 'Неверный логин или пароль' 
      };
    }

    const user = userResult[0];
    const storedPassword = user.password;
    const isVerified = user.isVerified;
    
    console.log('🔍 Данные пользователя:', {
      id: user.id,
      login: user.login,
      hashedPassword: storedPassword?.startsWith('$2b$') || storedPassword?.startsWith('$2a$'),
      isVerified: isVerified
    });

    // Проверка пароля
    let isPasswordValid = false;
    let needsPasswordMigration = false;

    // Случай 1: Хешированный пароль (новые пользователи через регистрацию)
    if (storedPassword && (storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2a$'))) {
      console.log('✅ Проверка хешированного пароля');
      isPasswordValid = await bcrypt.compare(password, storedPassword);
      
      // Для новых пользователей ОБЯЗАТЕЛЬНА проверка email
      if (isPasswordValid) {
        if (isVerified === 0 || isVerified === false || isVerified === null || isVerified === undefined) {
          console.log('❌ Email не подтвержден! Отказано в доступе.');
          return { 
            success: false, 
            error: 'Пожалуйста, подтвердите ваш email перед входом. Проверьте почту.',
            needsVerification: true 
          };
        }
        console.log('✅ Email подтвержден, доступ разрешен');
      }
    } 
    // Случай 2 и 3: Легаси-пользователи с паролями в открытом виде
    else if (storedPassword) {
      console.log('⚠️ Проверка легаси-пароля (без хеширования)');
      
      // Timing-safe сравнение паролей для защиты от timing attack
      const storedBuffer = Buffer.from(storedPassword, 'utf8');
      const inputBuffer = Buffer.from(password, 'utf8');
      
      // Если длины разные, создаем буфер той же длины для безопасного сравнения
      const maxLength = Math.max(storedBuffer.length, inputBuffer.length);
      const paddedStored = Buffer.alloc(maxLength);
      const paddedInput = Buffer.alloc(maxLength);
      storedBuffer.copy(paddedStored);
      inputBuffer.copy(paddedInput);
      
      try {
        isPasswordValid = crypto.timingSafeEqual(paddedStored, paddedInput) && 
                         storedBuffer.length === inputBuffer.length;
      } catch {
        isPasswordValid = false;
      }
      
      if (isPasswordValid) {
        // Помечаем для автоматической миграции на bcrypt
        needsPasswordMigration = true;
        console.log('⚠️ Легаси-пароль корректен, будет мигрирован на bcrypt');
        
        // Для старых пользователей проверяем email только если поле установлено
        if (isVerified === 0 || isVerified === false) {
          console.log('❌ Email не подтвержден у старого пользователя');
          return { 
            success: false, 
            error: 'Пожалуйста, подтвердите ваш email перед входом. Проверьте почту.',
            needsVerification: true 
          };
        }
      }
    }

    if (!isPasswordValid) {
      console.log('❌ Неверный пароль');
      return { 
        success: false, 
        error: 'Неверный логин или пароль' 
      };
    }

    // Миграция легаси-пароля на bcrypt при успешном входе
    if (needsPasswordMigration) {
      try {
        const hashedPassword = await hashPassword(password);
        await query(`
          UPDATE [Users] 
          SET password = @hashedPassword 
          WHERE id = @userId
        `, { 
          hashedPassword, 
          userId: user.id 
        });
        console.log('✅ Пароль пользователя мигрирован на bcrypt');
      } catch (migrationError) {
        // Миграция не критична, логируем но продолжаем вход
        console.error('⚠️ Не удалось мигрировать пароль:', migrationError);
      }
    }

    // Успешная аутентификация - устанавливаем сессию
    console.log('✅ Аутентификация успешна, устанавливаем сессию');
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
    
    console.log('✅ Пользователь успешно авторизован:', user.nicName);
    
    return { 
      success: true, 
      redirectTo: returnTo || '/dashboard' 
    };
    
  } catch (error) {
    console.error('❌ Ошибка при авторизации:', error);
    return { 
      success: false, 
      error: 'Произошла ошибка сервера. Попробуйте позже.' 
    };
  }
}

/**
 * Server Action для выхода пользователя
 */
export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('userId');
    cookieStore.delete('userNicName');
    console.log('✅ Пользователь вышел из системы');
    return { success: true };
  } catch (error) {
    console.error('❌ Ошибка при выходе:', error);
    return { success: false, error: 'Ошибка при выходе' };
  }
}

/**
 * Получить текущего авторизованного пользователя
 */
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
        e.companyId as employeeCompanyId
      FROM [Users] u
      LEFT JOIN Employee e ON u.id = e.userId
      WHERE u.id = @userId
    `, { userId: parseInt(userId) });
    
    if (result.length === 0) {
      return null;
    }
    
    const user = result[0];
    return {
      id: user.id,
      login: user.login,
      nicName: userNicName || user.nicName,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      companyId: user.companyId || user.employeeCompanyId // Приоритет Employee.companyId
    };
  } catch (error) {
    console.error('Ошибка при получении текущего пользователя:', error);
    return null;
  }
}
