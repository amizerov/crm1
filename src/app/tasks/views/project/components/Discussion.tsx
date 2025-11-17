'use client';

import { useState, useEffect } from 'react';
import { getProjectMessages, addProjectMessage, ProjectMessage } from '../actions/getMessages';

interface DiscussionProps {
  projectId: number;
}

export default function Discussion({ projectId }: DiscussionProps) {
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, [projectId]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const messagesData = await getProjectMessages(projectId);
      setMessages(messagesData);
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSendingMessage) return;

    try {
      setIsSendingMessage(true);
      await addProjectMessage(projectId, newMessage);
      setNewMessage('');
      
      // Перезагружаем сообщения
      const updatedMessages = await getProjectMessages(projectId);
      setMessages(updatedMessages);
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Загрузка обсуждения...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 pb-0">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Обсуждение проекта
        </h3>
      </div>
      
      {/* Сообщения */}
      <div className="flex-1 overflow-auto px-6">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-4">💬</div>
            <p>Сообщений пока нет</p>
            <p className="text-sm mt-2">Начните обсуждение проекта</p>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div key={message.id} className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                    {(message.user_name || 'У').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {message.user_name || 'Пользователь'}
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(message.dtc).toLocaleString('ru-RU')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap">
                    {message.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Форма отправки сообщения */}
      <div className="p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Написать сообщение..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim() || isSendingMessage}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSendingMessage ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              'Отправить'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
