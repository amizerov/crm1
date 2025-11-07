'use client';

import { useState, useEffect } from 'react';
import { getProjectDetails, ProjectDetails } from './actions/getDetails';
import { getProjectDocuments, getTaskDocuments, ProjectDocument } from './actions/getDocuments';
import { getProjectMessages, addProjectMessage, ProjectMessage } from './actions/getMessages';
import { getProjectTaskStats, ProjectTaskStats } from './actions/getTasks';
import Description from './components/Description';
import Documents from './components/Documents';

interface ProjectViewProps {
  projectId: number;
  currentUserId: number;
}

export default function ProjectView({ projectId, currentUserId }: ProjectViewProps) {
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [projectDocuments, setProjectDocuments] = useState<ProjectDocument[]>([]);
  const [taskDocuments, setTaskDocuments] = useState<ProjectDocument[]>([]);
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
      const [projectData, projectDocsData, taskDocsData, messagesData, taskStatsData] = await Promise.all([
        getProjectDetails(projectId),
        getProjectDocuments(projectId),
        getTaskDocuments(projectId),
        getProjectMessages(projectId),
        getProjectTaskStats(projectId)
      ]);
      
      setProject(projectData);
      setProjectDocuments(projectDocsData);
      setTaskDocuments(taskDocsData);
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
    { 
      id: 'description', 
      label: 'Описание', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      id: 'documents', 
      label: 'Документы', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      count: projectDocuments.length + taskDocuments.length 
    },
    { 
      id: 'discussion', 
      label: 'Обсуждение', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      count: messages.length 
    },
    { 
      id: 'secrets', 
      label: 'Секреты', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    }
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
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                w-[130px] h-[35px] px-3 py-2 rounded flex items-center justify-center gap-2 transition-colors text-sm font-medium cursor-pointer
                ${activeTab === tab.id 
                  ? 'bg-gray-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }
              `}
            >
              {tab.icon}
              <span className="truncate">
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && ` (${tab.count})`}
              </span>
            </button>
          ))}
        </div>
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
          <Documents 
            projectId={projectId}
            projectDocuments={projectDocuments}
            taskDocuments={taskDocuments}
            onDocumentsChanged={loadProjectData}
          />
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

        {activeTab === 'secrets' && (
          <div className="flex-1 p-6">
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Секреты проекта
              </h3>
              <p className="text-sm">Здесь будут храниться конфиденциальные данные проекта</p>
              <p className="text-xs mt-2 text-gray-400">Функционал в разработке</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}