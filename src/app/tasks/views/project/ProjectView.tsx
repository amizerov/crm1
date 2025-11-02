'use client';

import { useState, useEffect } from 'react';
import { getProjectDetails, ProjectDetails } from './actions/getDetails';
import { getProjectDocuments, ProjectDocument } from './actions/getDocuments';
import { getProjectMessages, addProjectMessage, ProjectMessage } from './actions/getMessages';
import { getProjectTaskStats, ProjectTaskStats } from './actions/getTasks';
import Description from './components/Description';

interface ProjectViewProps {
  projectId: number;
  currentUserId: number;
}

export default function ProjectView({ projectId, currentUserId }: ProjectViewProps) {
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [taskStats, setTaskStats] = useState<ProjectTaskStats>({ totalTasks: 0, completedTasks: 0, inProgressTasks: 0, todoTasks: 0 });
  const [activeTab, setActiveTab] = useState('description');
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      setIsLoading(true);
      const [projectData, documentsData, messagesData, taskStatsData] = await Promise.all([
        getProjectDetails(projectId),
        getProjectDocuments(projectId),
        getProjectMessages(projectId),
        getProjectTaskStats(projectId)
      ]);
      
      setProject(projectData);
      setDocuments(documentsData);
      setMessages(messagesData);
      setTaskStats(taskStatsData);
    } catch (error) {
      console.error('Ошибка загрузки данных проекта:', error);
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Загрузка проекта...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Проект не найден
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Выберите проект для просмотра деталей
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'description', label: 'Описание', icon: '📋' },
    { id: 'documents', label: 'Документы', icon: '📁', count: documents.length },
    { id: 'discussion', label: 'Обсуждение', icon: '💬', count: messages.length }
  ];

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 overflow-hidden">
      {/* Заголовок проекта */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                {project.projectName}
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">#{project.id}</span>
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {project.companyName} • {new Date(project.dtc).toLocaleDateString('ru-RU', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })} • Всего задач: {taskStats.totalTasks} • Выполнено: {taskStats.completedTasks} • В работе: {taskStats.inProgressTasks}
              </p>
            </div>
          </div>
          
          {/* Информация о создателе */}
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-300 text-sm font-medium">
                {(project.userNicName || project.userFullName || 'У').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="text-right">
              <div className="text-gray-500 dark:text-gray-400 text-xs">Создатель</div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {project.userNicName || project.userFullName || 'Неизвестный'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Табы */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Содержимое табов */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'description' && (
          <div className="flex-1 flex flex-col min-h-0 p-6">
            <Description 
              projectId={projectId}
              initialDescription={project.description}
              onDescriptionUpdated={loadProjectData}
            />
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="flex-1 overflow-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Документы проекта
              </h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Загрузить документ
              </button>
            </div>
            
            {documents.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-4">📁</div>
                <p>Документы не найдены</p>
                <p className="text-sm mt-2">
                  Загрузите документы или прикрепите их к задачам проекта
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {doc.originalName}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(doc.fileSize)} • {doc.uploader_name} • 
                          {doc.source === 'task' ? ` Задача: ${doc.task_title}` : ' Прямая загрузка'}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'discussion' && (
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
        )}
      </div>
    </div>
  );
}