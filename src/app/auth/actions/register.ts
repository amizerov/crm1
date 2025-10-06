'use server';

import { query } from '@/db/connect';
import { hashPassword } from '@/db/loginUser';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

export async function registerUser(email: string, password: string, fullName: string) {
  try {
    console.log('📝 Registration started for:', email);

    // 1. Проверка, существует ли пользователь
    const existingUser = await query(
      'SELECT id, isVerified FROM [User] WHERE login = @email',
      { email }
    );

    if (existingUser && existingUser.length > 0) {
      if (existingUser[0].isVerified) {
        return { error: 'Пользователь с таким email уже существует' };
      } else {
        return { error: 'Пользователь с таким email уже зарегистрирован, но не подтвержден. Проверьте почту.' };
      }
    }

    // 2. Хэшируем пароль
    const hashedPassword = await hashPassword(password);
    console.log('🔒 Password hashed');

    // 3. Генерируем nicName из fullName (первые буквы слов или полное имя)
    const nicName = fullName.trim().split(' ').map(word => word[0]).join('').toUpperCase() || fullName.substring(0, 10);
    console.log('📛 Generated nicName:', nicName);

    // 4. Создаем пользователя (НЕ подтвержденный)
    const result = await query(
      `INSERT INTO [User] (login, password, fullName, nicName, email, isVerified, dtc) 
       OUTPUT INSERTED.id
       VALUES (@email, @password, @fullName, @nicName, @email, 0, GETDATE())`,
      { email, password: hashedPassword, fullName, nicName }
    );

    const userId = result[0].id;
    console.log('👤 User created with ID:', userId, 'email:', email, 'isVerified: 0');

    // 5. Генерируем токен подтверждения (криптографически безопасный)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 часа

    console.log('🔑 Creating token:', { 
      userId, 
      tokenPreview: token.substring(0, 10) + '...', 
      expiresAt: expiresAt.toISOString() 
    });

    const insertResult = await query(
      `INSERT INTO VerificationToken (userId, token, expiresAt, createdAt)
       VALUES (@userId, @token, @expiresAt, GETDATE())`,
      { userId, token, expiresAt: expiresAt.toISOString() }
    );
    console.log('✅ Verification token created, result:', insertResult);

    // 6. Отправляем email
    const emailResult = await sendVerificationEmail(email, token);

    if (emailResult.error) {
      // Пользователь создан, но письмо не отправлено
      console.error('⚠️ User created but email failed');
      return { 
        error: 'Пользователь создан, но не удалось отправить письмо подтверждения. Обратитесь к администратору.' 
      };
    }

    console.log('✅ Registration completed successfully');
    return { 
      success: true, 
      message: 'Регистрация успешна! Проверьте email для подтверждения.' 
    };

  } catch (error) {
    console.error('❌ Registration error:', error);
    return { error: 'Ошибка при регистрации. Попробуйте позже.' };
  }
}
