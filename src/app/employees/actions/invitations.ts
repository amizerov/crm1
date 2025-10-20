'use server';

import { query } from '@/db/connect';
import { getCurrentUser } from '@/app/(auth)/actions/login';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

/**
 * Роль приглашаемого:
 * - Employee: создаётся только запись в таблице Employee (доступ к задачам)
 * - Partner: создаётся запись в Employee + User_Company (полные права на управление компанией)
 */
export type InvitationRole = 'Employee' | 'Partner';

interface CreateInvitationParams {
  email: string;
  companyId: number;
  role: InvitationRole;
}

/**
 * Создать и отправить приглашение
 * Только партнёры компании (те, у кого есть запись в User_Company) могут приглашать других
 */
export async function createInvitation({ email, companyId, role }: CreateInvitationParams) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { error: 'Необходима авторизация' };
    }

    // Проверяем права (пользователь должен быть партнёром этой компании)
    // Партнёр = наличие записи в User_Company
    const userCompanyCheck = await query(`
      SELECT 1 FROM User_Company 
      WHERE userId = @userId AND companyId = @companyId
    `, { userId: currentUser.id, companyId });

    if (userCompanyCheck.length === 0) {
      return { error: 'У вас нет доступа к этой компании. Только партнёры могут приглашать сотрудников.' };
    }

    // Проверяем, не приглашён ли уже этот email
    const existingInvitation = await query(`
      SELECT id, status FROM Invitation
      WHERE email = @email AND companyId = @companyId AND status = 'pending'
    `, { email, companyId });

    if (existingInvitation.length > 0) {
      return { error: 'Приглашение для этого email уже отправлено' };
    }

    // Проверяем, не является ли пользователь уже сотрудником
    const existingEmployee = await query(`
      SELECT e.id 
      FROM Employee e
      JOIN [Users] u ON e.userId = u.id
      WHERE u.email = @email AND e.companyId = @companyId
    `, { email, companyId });

    if (existingEmployee.length > 0) {
      return { error: 'Этот пользователь уже является сотрудником компании' };
    }

    // Получаем название компании
    const companyInfo = await query(`
      SELECT companyName FROM Company WHERE id = @companyId
    `, { companyId });

    if (companyInfo.length === 0) {
      return { error: 'Компания не найдена' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 дней

    // Создаём приглашение
    await query(`
      INSERT INTO Invitation (email, companyId, invitedByUserId, role, token, expiresAt)
      VALUES (@email, @companyId, @invitedByUserId, @role, @token, @expiresAt)
    `, { 
      email, 
      companyId, 
      invitedByUserId: currentUser.id, 
      role, 
      token, 
      expiresAt 
    });

    // Формируем и отправляем email
    const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/employees/acceptinvitation?token=${token}`;
    const companyName = companyInfo[0].companyName;
    const inviterName = currentUser.nicName || currentUser.login;

    const roleText = role === 'Partner' ? 'партнёром' : 'сотрудником';
    const roleDescription = role === 'Partner' 
      ? 'Вы сможете управлять проектами, задачами и приглашать других сотрудников.'
      : 'Вы сможете работать над задачами и проектами компании.';

    const subject = `Приглашение стать ${roleText} в ${companyName}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0;
              padding: 0;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              padding: 30px; 
              text-align: center; 
              border-radius: 10px 10px 0 0; 
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content { 
              background: #f9f9f9; 
              padding: 30px; 
              border-radius: 0 0 10px 10px; 
            }
            .button { 
              display: inline-block; 
              padding: 15px 30px; 
              background: #667eea; 
              color: white !important; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0;
              font-weight: bold;
            }
            .button:hover {
              background: #5568d3;
            }
            .info-box {
              background: #e8eaf6;
              border-left: 4px solid #667eea;
              padding: 15px;
              margin: 15px 0;
            }
            .link-box {
              word-break: break-all; 
              background: #fff; 
              padding: 10px; 
              border-left: 4px solid #667eea;
              margin: 15px 0;
            }
            .footer { 
              text-align: center; 
              margin-top: 20px; 
              color: #666; 
              font-size: 12px; 
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 10px;
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🤝 Приглашение в команду</h1>
            </div>
            <div class="content">
              <p>Здравствуйте!</p>
              <p><strong>${inviterName}</strong> приглашает вас стать <strong>${roleText}</strong> компании <strong>${companyName}</strong> в системе Argo CRM.</p>
              
              <div class="info-box">
                <strong>Роль: ${role === 'Partner' ? '👔 Партнёр' : '👤 Сотрудник'}</strong><br>
                ${roleDescription}
              </div>
              
              <p style="text-align: center;">
                <a href="${invitationUrl}" class="button">Принять приглашение</a>
              </p>
              
              <p>Или скопируйте эту ссылку в браузер:</p>
              <div class="link-box">
                ${invitationUrl}
              </div>
              
              <div class="warning">
                <strong>⏰ Важно:</strong> Ссылка действительна 7 дней.
              </div>
              
              <p>Если у вас ещё нет аккаунта в Argo CRM, вы сможете зарегистрироваться при принятии приглашения.</p>
              
              <p>Если вы не ожидали это приглашение, просто проигнорируйте это письмо.</p>
              
              <p>С уважением,<br>Команда Argo CRM</p>
            </div>
            <div class="footer">
              <p>© 2025 Argo CRM. Все права защищены.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Приглашение в команду

${inviterName} приглашает вас стать ${roleText} компании ${companyName} в системе Argo CRM.

Роль: ${role}
${roleDescription}

Для принятия приглашения перейдите по ссылке:
${invitationUrl}

Ссылка действительна 7 дней.

Если у вас ещё нет аккаунта в Argo CRM, вы сможете зарегистрироваться при принятии приглашения.

Если вы не ожидали это приглашение, просто проигнорируйте это письмо.

С уважением,
Команда Argo CRM
    `.trim();

    const emailResult = await sendEmail(email, subject, html, text);

    if (emailResult.error) {
      return { error: emailResult.error };
    }

    return { success: true, message: 'Приглашение отправлено' };
  } catch (error) {
    console.error('Error creating invitation:', error);
    return { error: 'Ошибка при создании приглашения' };
  }
}

/**
 * Получить информацию о приглашении по токену
 */
export async function getInvitationByToken(token: string) {
  try {
    const invitation = await query(`
      SELECT 
        i.id,
        i.email,
        i.companyId,
        i.role,
        i.status,
        i.expiresAt,
        c.companyName,
        u.nicName as inviterName
      FROM Invitation i
      JOIN Company c ON i.companyId = c.id
      JOIN [Users] u ON i.invitedByUserId = u.id
      WHERE i.token = @token
    `, { token });

    if (invitation.length === 0) {
      return { error: 'Приглашение не найдено' };
    }

    const inv = invitation[0];

    if (inv.status !== 'pending') {
      return { error: 'Приглашение уже использовано' };
    }

    if (new Date(inv.expiresAt) < new Date()) {
      await query(`UPDATE Invitation SET status = 'expired' WHERE id = @id`, { id: inv.id });
      return { error: 'Срок действия приглашения истёк' };
    }

    return { invitation: inv };
  } catch (error) {
    console.error('Error getting invitation:', error);
    return { error: 'Ошибка при получении приглашения' };
  }
}

/**
 * Принять приглашение
 * Создаёт записи Employee и User_Company (если роль Partner)
 */
export async function acceptInvitation(token: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { error: 'Необходима авторизация' };
    }

    // Получаем приглашение
    const invitationResult = await getInvitationByToken(token);
    if (invitationResult.error) {
      return { error: invitationResult.error };
    }

    const invitation = invitationResult.invitation!;

    // Проверяем email
    if (currentUser.email !== invitation.email) {
      return { error: 'Это приглашение предназначено для другого email' };
    }

    // Проверяем, не является ли пользователь уже сотрудником
    const existingEmployee = await query(`
      SELECT id FROM Employee
      WHERE userId = @userId AND companyId = @companyId
    `, { userId: currentUser.id, companyId: invitation.companyId });

    if (existingEmployee.length > 0) {
      // Обновляем приглашение как принятое
      await query(`
        UPDATE Invitation 
        SET status = 'accepted', acceptedAt = GETDATE(), acceptedByUserId = @userId
        WHERE id = @invitationId
      `, { userId: currentUser.id, invitationId: invitation.id });

      return { error: 'Вы уже являетесь сотрудником этой компании' };
    }

    // Создаём сотрудника
    const employeeName = currentUser.nicName || currentUser.fullName || currentUser.login;
    await query(`
      INSERT INTO Employee (userId, Name, companyId, dtc)
      VALUES (@userId, @name, @companyId, GETDATE())
    `, { 
      userId: currentUser.id, 
      name: employeeName, 
      companyId: invitation.companyId 
    });

    // Если роль Partner - добавляем в User_Company
    if (invitation.role === 'Partner') {
      const existingPartner = await query(`
        SELECT 1 FROM User_Company
        WHERE userId = @userId AND companyId = @companyId
      `, { userId: currentUser.id, companyId: invitation.companyId });

      if (existingPartner.length === 0) {
        await query(`
          INSERT INTO User_Company (userId, companyId)
          VALUES (@userId, @companyId)
        `, { userId: currentUser.id, companyId: invitation.companyId });
      }
    }

    // Обновляем статус приглашения
    await query(`
      UPDATE Invitation 
      SET status = 'accepted', acceptedAt = GETDATE(), acceptedByUserId = @userId, dtu = GETDATE()
      WHERE id = @invitationId
    `, { userId: currentUser.id, invitationId: invitation.id });

    return { 
      success: true, 
      message: `Вы успешно присоединились к компании ${invitation.companyName}`,
      role: invitation.role
    };
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return { error: 'Ошибка при принятии приглашения' };
  }
}
