'use server';

import { query } from '@/db/connect';
import { hashPassword } from './login';
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

/**
 * Регистрация пользователя через приглашение
 * Создает пользователя с подтвержденным email и сразу связывает с компанией
 */
export async function registerWithInvitation(token: string, password: string, fullName: string) {
  try {
    console.log('📝 Registration with invitation started, token:', token.substring(0, 10) + '...');

    // 1. Получаем и проверяем приглашение
    const { getInvitationByToken } = await import('@/app/employees/actions/invitations');
    const invitationResult = await getInvitationByToken(token);

    if (invitationResult.error) {
      return { error: invitationResult.error };
    }

    const invitation = invitationResult.invitation!;
    const email = invitation.email;

    // 2. Проверяем, не существует ли уже пользователь
    const existingUser = await query(
      'SELECT id, isVerified FROM [User] WHERE login = @email',
      { email }
    );

    if (existingUser && existingUser.length > 0) {
      return { error: 'Пользователь с таким email уже существует. Используйте страницу принятия приглашения.' };
    }

    // 3. Хэшируем пароль
    const hashedPassword = await hashPassword(password);
    console.log('🔒 Password hashed');

    // 4. Генерируем nicName из fullName
    const nicName = fullName.trim().split(' ').map(word => word[0]).join('').toUpperCase() || fullName.substring(0, 10);
    console.log('📛 Generated nicName:', nicName);

    // 5. Создаем пользователя (УЖЕ подтвержденный через приглашение)
    const userResult = await query(
      `INSERT INTO [User] (login, password, fullName, nicName, email, isVerified, dtc) 
       OUTPUT INSERTED.id
       VALUES (@email, @password, @fullName, @nicName, @email, 1, GETDATE())`,
      { email, password: hashedPassword, fullName, nicName }
    );

    const userId = userResult[0].id;
    console.log('👤 User created with ID:', userId, 'email:', email, 'isVerified: 1 (via invitation)');

    // 6. Создаем сотрудника
    const employeeName = nicName || fullName || email;
    await query(
      `INSERT INTO Employee (userId, Name, companyId, dtc)
       VALUES (@userId, @name, @companyId, GETDATE())`,
      { 
        userId, 
        name: employeeName, 
        companyId: invitation.companyId 
      }
    );
    console.log('👥 Employee created for user:', userId, 'in company:', invitation.companyId);

    // 7. Если роль Partner - добавляем в User_Company
    if (invitation.role === 'Partner') {
      await query(
        `INSERT INTO User_Company (userId, companyId)
         VALUES (@userId, @companyId)`,
        { userId, companyId: invitation.companyId }
      );
      console.log('🤝 Partner relationship created in User_Company');
    }

    // 8. Обновляем статус приглашения
    await query(
      `UPDATE Invitation 
       SET status = 'accepted', acceptedAt = GETDATE(), acceptedByUserId = @userId
       WHERE id = @invitationId`,
      { userId, invitationId: invitation.id }
    );
    console.log('✅ Invitation marked as accepted');

    // 9. Создаем сессию (устанавливаем cookie)
    const { cookies } = await import('next/headers');
    (await cookies()).set('userId', userId.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 дней
    });
    console.log('🍪 Session cookie set for user:', userId);

    return { 
      success: true, 
      message: `Добро пожаловать в ${invitation.companyName}! Вы успешно присоединились как ${invitation.role === 'Partner' ? 'партнёр' : 'сотрудник'}.` 
    };

  } catch (error) {
    console.error('❌ Registration with invitation error:', error);
    return { error: 'Ошибка при регистрации через приглашение. Попробуйте позже.' };
  }
}
