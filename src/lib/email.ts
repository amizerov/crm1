'use server';

import nodemailer from 'nodemailer';

// Настройка транспорта для отправки email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true для 465, false для других портов
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD?.replace(/^["']|["']$/g, ''), // Убираем кавычки если есть
  },
});

/**
 * Универсальная функция отправки email
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<{ success?: boolean; error?: string }> {
  const mailOptions = {
    from: `"TMS, RCC" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent to:', to);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    if (error instanceof Error) {
      console.error('❌ Error details:', error.message);
    }
    return { error: 'Не удалось отправить email' };
  }
}

/**
 * Отправка письма с подтверждением регистрации
 */
export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}`;

  const subject = 'Подтверждение регистрации в TMS, RCC';
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
              <h1>🎉 Добро пожаловать в TMS, RCC!</h1>
            </div>
            <div class="content">
              <p>Здравствуйте!</p>
              <p>Спасибо за регистрацию в <strong>TMS, RCC</strong>. Для завершения регистрации необходимо подтвердить ваш email адрес.</p>
              
              <p style="text-align: center;">
                <a href="${verificationUrl}" class="button">Подтвердить Email</a>
              </p>
              
              <p>Или скопируйте эту ссылку в браузер:</p>
              <div class="link-box">
                ${verificationUrl}
              </div>
              
              <div class="warning">
                <strong>⏰ Важно:</strong> Ссылка действительна 24 часа.
              </div>
              
              <p>Если вы не регистрировались в TMS, RCC, просто проигнорируйте это письмо.</p>
              
              <p>С уважением,<br>Команда TMS, RCC</p>
            </div>
            <div class="footer">
              <p>© 2025 TMS, RCC. Все права защищены.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  const text = `
Добро пожаловать в TMS, RCC!

Для подтверждения регистрации перейдите по ссылке:
${verificationUrl}

Ссылка действительна 24 часа.

Если вы не регистрировались в TMS, RCC, просто проигнорируйте это письмо.

С уважением,
Команда TMS, RCC
    `.trim();

  return sendEmail(email, subject, html, text);
}
