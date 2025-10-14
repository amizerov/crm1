import { redirect } from 'next/navigation';
import { getInvitationByToken } from '../actions/invitations';
import { getCurrentUser } from '@/app/(auth)/actions/login';
import AcceptInvitationForm from './AcceptInvitationForm';

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function AcceptInvitationPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const token = resolvedParams.token;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Неверная ссылка
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Ссылка для принятия приглашения недействительна.
            </p>
            <a
              href="/login"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Перейти к входу
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Получаем информацию о приглашении
  const invitationResult = await getInvitationByToken(token);

  if (invitationResult.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Ошибка приглашения
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {invitationResult.error}
            </p>
            <a
              href="/login"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Перейти к входу
            </a>
          </div>
        </div>
      </div>
    );
  }

  const invitation = invitationResult.invitation!;
  const currentUser = await getCurrentUser();

  // Если пользователь не авторизован - редирект на специальную регистрацию через приглашение
  if (!currentUser) {
    redirect(`/register/invitation?token=${token}`);
  }

  // Проверяем, совпадает ли email текущего пользователя с приглашением
  if (currentUser.email !== invitation.email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Несоответствие email
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Это приглашение предназначено для: <strong>{invitation.email}</strong>
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Вы вошли как: <strong>{currentUser.email}</strong>
            </p>
            <div className="space-y-3">
              <a
                href="/login"
                className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
              >
                Войти другим пользователем
              </a>
              <a
                href="/dashboard"
                className="block w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-center"
              >
                На главную
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Всё ок, показываем форму принятия приглашения
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🤝</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Приглашение в команду
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {invitation.inviterName} приглашает вас
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Компания:</span>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {invitation.companyName}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Роль:</span>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {invitation.role === 'Partner' ? '👔 Партнёр' : '👤 Сотрудник'}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Описание:</span>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {invitation.role === 'Partner'
                  ? 'Вы сможете управлять проектами, задачами и приглашать других сотрудников.'
                  : 'Вы сможете работать над задачами и проектами компании.'}
              </p>
            </div>
          </div>
        </div>

        <AcceptInvitationForm token={token} invitation={invitation} currentUser={currentUser} />
      </div>
    </div>
  );
}
