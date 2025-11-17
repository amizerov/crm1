'use client';

import { useState, useEffect } from 'react';
import { 
  getProjectSecrets, 
  addProjectSecret, 
  deleteProjectSecret,
  verifyMasterPassword,
  logSecretAccess,
  ProjectSecret 
} from '../actions/getSecrets';

interface SecretsProps {
  projectId: number;
}

export default function Secrets({ projectId }: SecretsProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [secrets, setSecrets] = useState<ProjectSecret[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [revealedSecrets, setRevealedSecrets] = useState<Set<number>>(new Set());
  
  const [isAddingSecret, setIsAddingSecret] = useState(false);
  const [newSecret, setNewSecret] = useState({
    key: '',
    value: '',
    description: ''
  });

  // Автоматическая блокировка через 5 минут бездействия
  useEffect(() => {
    if (!isUnlocked) return;

    let timeout: NodeJS.Timeout;
    
    const resetTimeout = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIsUnlocked(false);
        setRevealedSecrets(new Set());
        setMasterPassword('');
      }, 5 * 60 * 1000); // 5 минут
    };

    resetTimeout();

    const handleActivity = () => resetTimeout();
    
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [isUnlocked]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!masterPassword.trim()) {
      setPasswordError('Введите мастер-пароль');
      return;
    }

    setIsVerifying(true);
    setPasswordError('');

    try {
      const isValid = await verifyMasterPassword(projectId, masterPassword);
      
      if (isValid) {
        setIsUnlocked(true);
        loadSecrets();
      } else {
        setPasswordError('Неверный мастер-пароль');
        setMasterPassword('');
      }
    } catch (error) {
      setPasswordError('Ошибка проверки пароля');
      console.error('Error verifying password:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const loadSecrets = async () => {
    try {
      setIsLoading(true);
      const data = await getProjectSecrets(projectId);
      setSecrets(data);
    } catch (error) {
      console.error('Error loading secrets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    setRevealedSecrets(new Set());
    setMasterPassword('');
    setIsAddingSecret(false);
  };

  const toggleRevealSecret = async (secretId: number) => {
    const isCurrentlyRevealed = revealedSecrets.has(secretId);
    
    if (isCurrentlyRevealed) {
      // Скрываем секрет
      setRevealedSecrets(prev => {
        const newSet = new Set(prev);
        newSet.delete(secretId);
        return newSet;
      });
    } else {
      // Показываем секрет
      setRevealedSecrets(prev => {
        const newSet = new Set(prev);
        newSet.add(secretId);
        return newSet;
      });
      
      // Логируем просмотр секрета (вне setState)
      try {
        await logSecretAccess(secretId, 'view');
      } catch (error) {
        console.error('Error logging secret access:', error);
      }
    }
  };

  const handleAddSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSecret.key.trim() || !newSecret.value.trim()) {
      return;
    }

    try {
      const createdSecret = await addProjectSecret(
        projectId,
        newSecret.key,
        newSecret.value,
        newSecret.description || undefined
      );
      
      setSecrets([...secrets, createdSecret]);
      setNewSecret({ key: '', value: '', description: '' });
      setIsAddingSecret(false);
    } catch (error) {
      console.error('Error adding secret:', error);
      alert(error instanceof Error ? error.message : 'Ошибка добавления секрета');
    }
  };

  const handleDeleteSecret = async (secretId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот секрет?')) {
      return;
    }

    try {
      await deleteProjectSecret(secretId);
      
      setSecrets(secrets.filter(s => s.id !== secretId));
      setRevealedSecrets(prev => {
        const newSet = new Set(prev);
        newSet.delete(secretId);
        return newSet;
      });
    } catch (error) {
      console.error('Error deleting secret:', error);
      alert('Ошибка удаления секрета');
    }
  };

  const copyToClipboard = async (text: string, secretId: number) => {
    try {
      await navigator.clipboard.writeText(text);
      // Логируем копирование секрета
      await logSecretAccess(secretId, 'copy');
      // TODO: Показать уведомление об успешном копировании
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  // Экран разблокировки
  if (!isUnlocked) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Секреты проекта
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Введите мастер-пароль для доступа к секретам
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label htmlFor="masterPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Мастер-пароль
              </label>
              <input
                type="password"
                id="masterPassword"
                value={masterPassword}
                onChange={(e) => {
                  setMasterPassword(e.target.value);
                  setPasswordError('');
                }}
                className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  passwordError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Введите пароль..."
                autoFocus
              />
              {passwordError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {passwordError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isVerifying || !masterPassword.trim()}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isVerifying ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Проверка...
                </span>
              ) : (
                'Разблокировать'
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-medium mb-1">Безопасность:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-400">
                  <li>Доступ автоматически блокируется через 5 минут бездействия</li>
                  <li>Секреты хранятся в зашифрованном виде</li>
                  <li>История доступа логируется</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Экран управления секретами
  return (
    <div className="flex-1 flex flex-col p-6">
      {/* Заголовок с кнопкой блокировки */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Секреты проекта
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Храните конфиденциальные данные в безопасности
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAddingSecret(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Добавить секрет</span>
          </button>
          <button
            onClick={handleLock}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Заблокировать</span>
          </button>
        </div>
      </div>

      {/* Форма добавления секрета */}
      {isAddingSecret && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
            Новый секрет
          </h4>
          <form onSubmit={handleAddSecret} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ключ *
              </label>
              <input
                type="text"
                value={newSecret.key}
                onChange={(e) => setNewSecret({ ...newSecret, key: e.target.value })}
                placeholder="например: API_KEY"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Значение *
              </label>
              <textarea
                value={newSecret.value}
                onChange={(e) => setNewSecret({ ...newSecret, value: e.target.value })}
                placeholder="Секретное значение..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono resize-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Описание
              </label>
              <input
                type="text"
                value={newSecret.description}
                onChange={(e) => setNewSecret({ ...newSecret, description: e.target.value })}
                placeholder="Для чего используется этот секрет..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Добавить
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingSecret(false);
                  setNewSecret({ key: '', value: '', description: '' });
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm font-medium"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Список секретов */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : secrets.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-4">🔐</div>
          <p>Секретов пока нет</p>
          <p className="text-sm mt-2">Добавьте первый секрет для проекта</p>
        </div>
      ) : (
        <div className="space-y-3 flex-1 overflow-auto">
          {secrets.map((secret) => (
            <div
              key={secret.id}
              className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-mono">
                      {secret.key}
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(secret.created_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  {secret.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {secret.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteSecret(secret.id)}
                  className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1"
                  title="Удалить секрет"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 font-mono text-sm overflow-hidden">
                  {revealedSecrets.has(secret.id) ? (
                    <span className="text-gray-900 dark:text-gray-100 break-all">
                      {secret.value}
                    </span>
                  ) : (
                    <span className="text-gray-400">
                      {'•'.repeat(Math.min(secret.value.length, 40))}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => toggleRevealSecret(secret.id)}
                  className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  title={revealedSecrets.has(secret.id) ? 'Скрыть' : 'Показать'}
                >
                  {revealedSecrets.has(secret.id) ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => copyToClipboard(secret.value, secret.id)}
                  className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  title="Копировать"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
