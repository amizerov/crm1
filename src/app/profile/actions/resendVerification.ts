'use server';

import { query } from '@/db/connect';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

/**
 * Повторная отправка письма подтверждения email
 */
export async function resendVerificationEmail(userId: number, email: string) {
  try {
    console.log('📧 Resending verification email for userId:', userId, 'email:', email);

    // 1. Проверяем, не подтверждён ли уже email
    const userResult = await query(
      `SELECT isVerified FROM [Users] WHERE id = @userId`,
      { userId }
    );

    if (!userResult || userResult.length === 0) {
      return { error: 'Пользователь не найден' };
    }

    if (userResult[0].isVerified) {
      return { error: 'Email уже подтверждён' };
    }

    // 2. Удаляем старые токены для этого пользователя
    await query(
      `DELETE FROM VerificationToken WHERE userId = @userId`,
      { userId }
    );

    // 3. Генерируем новый токен
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 часа

    console.log('🔑 Creating new token:', { 
      userId, 
      tokenPreview: token.substring(0, 10) + '...', 
      expiresAt: expiresAt.toISOString() 
    });

    // 4. Сохраняем новый токен
    await query(
      `INSERT INTO VerificationToken (userId, token, expiresAt, createdAt)
       VALUES (@userId, @token, @expiresAt, GETDATE())`,
      { userId, token, expiresAt: expiresAt.toISOString() }
    );

    // 5. Отправляем email
    const emailResult = await sendVerificationEmail(email, token);

    if (emailResult.error) {
      console.error('⚠️ Failed to send verification email');
      return { error: 'Не удалось отправить письмо подтверждения. Попробуйте позже.' };
    }

    console.log('✅ Verification email resent successfully');
    return { 
      success: true, 
      message: 'Письмо с подтверждением отправлено! Проверьте почту.' 
    };

  } catch (error) {
    console.error('❌ Error resending verification email:', error);
    return { error: 'Произошла ошибка. Попробуйте позже.' };
  }
}
