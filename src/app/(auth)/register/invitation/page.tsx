import { redirect } from 'next/navigation';
import { getInvitationByToken } from '@/app/employees/actions/invitations';
import { getCurrentUser } from '@/app/(auth)/actions/login';
import InvitationRegisterForm from './InvitationRegisterForm';

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function InvitationRegisterPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  if (!token) {
    redirect('/register');
  }

  // Проверяем не авторизован ли пользователь уже
  const currentUser = await getCurrentUser();
  if (currentUser) {
    // Если уже авторизован, перенаправляем обратно на принятие приглашения
    redirect(`/employees/acceptinvitation?token=${token}`);
  }

  // Получаем информацию о приглашении
  const invitationResult = await getInvitationByToken(token);

  if (invitationResult.error) {
    return (
      <>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Ошибка приглашения
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {invitationResult.error}
          </p>
        </div>
        <div className="text-center">
          <a
            href="/register"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Обычная регистрация
          </a>
        </div>
      </>
    );
  }

  const invitation = invitationResult.invitation!;

  return (
    <>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Регистрация по приглашению
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Вас пригласил <strong>{invitation.inviterName}</strong> в компанию <strong>{invitation.companyName}</strong>
        </p>
      </div>

      {/* Информация о приглашении */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Email:</span>
            <div>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{invitation.email}</span>
              <span className="ml-2 text-green-600 dark:text-green-400 text-xs">✓ Подтвержден</span>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Роль:</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {invitation.role === 'Partner' ? 'Партнёр' : 'Сотрудник'}
            </span>
          </div>
        </div>
      </div>

      <InvitationRegisterForm token={token} invitation={invitation} />
    </>
  );
}