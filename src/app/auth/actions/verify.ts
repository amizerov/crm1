'use server';

import { query } from '@/db/connect';

export async function verifyEmail(token: string) {
  try {
    console.log('🔍 Verifying token:', token.substring(0, 10) + '...', 'length:', token.length);

    // Проверим, есть ли вообще токены в базе
    const allTokens = await query(`SELECT COUNT(*) as count FROM VerificationToken`);
    console.log('📊 Total tokens in DB:', allTokens[0]?.count);

    // 1. Находим токен
    const tokenResult = await query(
      `SELECT userId, expiresAt FROM VerificationToken WHERE token = @token`,
      { token }
    );

    console.log('🔍 Token search result:', tokenResult);

    if (!tokenResult || tokenResult.length === 0) {
      console.log('❌ Token not found in database');
      return { error: 'Неверный или устаревший токен' };
    }

    const { userId, expiresAt } = tokenResult[0];

    // 2. Проверяем срок действия
    if (new Date(expiresAt) < new Date()) {
      console.log('⏰ Token expired');
      return { error: 'Срок действия токена истек. Обратитесь к администратору для повторной отправки.' };
    }

    // 3. Проверяем, не подтвержден ли уже пользователь
    const userResult = await query(
      `SELECT isVerified FROM [User] WHERE id = @userId`,
      { userId }
    );

    if (userResult && userResult.length > 0 && userResult[0].isVerified) {
      console.log('ℹ️ User already verified');
      return { success: true, message: 'Email уже был подтвержден ранее!' };
    }

    // 4. Активируем пользователя
    await query(
      `UPDATE [User] SET isVerified = 1 WHERE id = @userId`,
      { userId }
    );
    console.log('✅ User verified:', userId);

    // 5. Удаляем использованный токен
    await query(
      `DELETE FROM VerificationToken WHERE token = @token`,
      { token }
    );
    console.log('🗑️ Token deleted');

    return { success: true, message: 'Email успешно подтвержден! Теперь вы можете войти в систему.' };

  } catch (error) {
    console.error('❌ Verification error:', error);
    return { error: 'Ошибка при подтверждении email. Попробуйте позже.' };
  }
}
