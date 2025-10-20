'use server';

import { query } from '@/db/connect';

export async function verifyEmail(token: string) {
  try {
    console.log('=== ВЕРИФИКАЦИЯ EMAIL НАЧАТА ===');
    console.log('🔍 Verifying token:', token.substring(0, 10) + '...', 'length:', token.length);
    console.log('🔍 Full token:', token);

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
      `SELECT isVerified FROM [Users] WHERE id = @userId`,
      { userId }
    );

    if (userResult && userResult.length > 0 && userResult[0].isVerified) {
      console.log('ℹ️ Users already verified');
      return { success: true, message: 'Email уже был подтвержден ранее!' };
    }

    // 4. Активируем пользователя
    console.log('🔄 Updating user isVerified to 1 for userId:', userId);
    const updateResult = await query(
      `UPDATE [Users] SET isVerified = 1 WHERE id = @userId`,
      { userId }
    );
    console.log('✅ Users verified:', userId, 'Update result:', updateResult);

    // 5. Удаляем использованный токен
    console.log('🗑️ Deleting token...');
    const deleteResult = await query(
      `DELETE FROM VerificationToken WHERE token = @token`,
      { token }
    );
    console.log('🗑️ Token deleted, Delete result:', deleteResult);

    console.log('=== ВЕРИФИКАЦИЯ EMAIL ЗАВЕРШЕНА УСПЕШНО ===');
    return { success: true, message: 'Email успешно подтвержден! Теперь вы можете войти в систему.' };

  } catch (error) {
    console.error('❌ Verification error:', error);
    return { error: 'Ошибка при подтверждении email. Попробуйте позже.' };
  }
}
