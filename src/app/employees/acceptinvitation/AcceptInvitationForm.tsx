'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { acceptInvitation } from '../actions/invitations';

interface Invitation {
  id: number;
  email: string;
  companyId: number;
  companyName: string;
  role: string;
  inviterName: string;
}

interface Users {
  id: number;
  email: string;
  nicName: string;
  login: string;
}

interface Props {
  token: string;
  invitation: Invitation;
  currentUser: Users;
}

export default function AcceptInvitationForm({ token, invitation, currentUser }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAccept = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await acceptInvitation(token);

      if (result.error) {
        setError(result.error);
        setIsLoading(false);
      } else {
        // Успешно принято - редирект на страницу сотрудников
        router.push('/employees?invitation=accepted');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
      setIsLoading(false);
    }
  };

  const handleDecline = () => {
    router.push('/dashboard');
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleDecline}
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Отклонить
        </button>
        <button
          onClick={handleAccept}
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isLoading ? 'Принимаю...' : 'Принять приглашение'}
        </button>
      </div>

      <p className="text-xs text-center text-gray-500 dark:text-gray-400">
        Вы войдёте как <strong>{currentUser.nicName || currentUser.login}</strong>
      </p>
    </div>
  );
}
