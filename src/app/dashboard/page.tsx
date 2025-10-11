'use client';

import { useState, useEffect } from 'react';
import Tooltip from './Tooltip';
import ButtonCard from './ButtonCard';
import { checkTasksAvailability } from './actions/checkTasks';
import { checkClientsAvailability } from './actions/checkClients';
import { checkEmployeesAvailability } from './actions/checkEmploys';
import { checkProjectsAvailability } from './actions/checkProjects';
import { getUserCompanies } from '@/app/projects/actions/actions';
import { getProjectsByCompany } from '@/app/projects/actions/actions';

export default function DashboardPage() {
  const [highlightedCard, setHighlightedCard] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>('');
  const [selectedProjectName, setSelectedProjectName] = useState<string>('');
  const [selectedProjectsCompanyName, setSelectedProjectsCompanyName] = useState<string>('');

  useEffect(() => {
    // Получаем имя пользователя из куки
    const cookies = document.cookie.split('; ');
    const userNicNameCookie = cookies.find(c => c.startsWith('userNicName='));
    if (userNicNameCookie) {
      setUserName(decodeURIComponent(userNicNameCookie.split('=')[1]));
    }

    // Получаем выбранную компанию и проект из localStorage
    const loadSelectedData = async () => {
      try {
        const selectedCompanyId = localStorage.getItem('selectedCompanyId');
        const selectedProjectId = localStorage.getItem('selectedProjectId');
        
        if (selectedCompanyId || selectedProjectId) {
          const companies = await getUserCompanies();
          
          // Для задач: находим название компании и проекта
          if (selectedCompanyId && selectedCompanyId !== '0') {
            const company = companies.find((c: any) => c.id === parseInt(selectedCompanyId));
            if (company) {
              setSelectedCompanyName(company.companyName);
              setSelectedProjectsCompanyName(company.companyName); // Используем ту же компанию для проектов
              
              // Получаем проекты для этой компании
              if (selectedProjectId && selectedProjectId !== '0') {
                const projects = await getProjectsByCompany(parseInt(selectedCompanyId));
                const project = projects.find((p: any) => p.id === parseInt(selectedProjectId));
                if (project) {
                  setSelectedProjectName(project.projectName);
                }
              }
            }
          } else if (selectedCompanyId === '0') {
            setSelectedCompanyName('Все компании');
            setSelectedProjectsCompanyName('Все компании');
          }
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      }
    };

    loadSelectedData();
  }, []);

  return (
    <div style={{ 
      padding: '20px 0',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      //overflow: 'hidden'
    }}>
      {/* Приветствие */}
      <div style={{ 
        marginBottom: 24, 
        textAlign: 'center',
        flexShrink: 0
      }}>
        <h1 style={{ 
          margin: '0 0 8px 0', 
          fontSize: 'clamp(24px, 4vw, 32px)', 
          color: '#333' 
        }}>
          Добро пожаловать{userName && `, ${userName}`}!
        </h1>
        <p style={{ 
          margin: 0, 
          color: '#666', 
          fontSize: 'clamp(14px, 2vw, 16px)' 
        }}>
          Выберите раздел для работы
        </p>
      </div>

      {/* Навигационные карточки */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 16,
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        flex: '1',
        minHeight: 0,
        alignContent: 'start'
      }}>
        {/* Клиенты - с проверкой */}
        <div style={{ position: 'relative' }}>
          <ButtonCard
            icon="👥"
            title="Клиенты"
            description={`Управление базой клиентов${selectedCompanyName ? `\n🏢 ${selectedCompanyName}` : ''}`}
            href="/clients"
            color="#007bff"
            cardId="clients"
            checkAvailability={checkClientsAvailability}
            isHighlighted={highlightedCard === 'clients'}
            onHighlight={setHighlightedCard}
            onShowTooltip={setTooltip}
          />
          {tooltip && highlightedCard === 'clients' && <Tooltip message={tooltip} position="top" />}
        </div>

        {/* Компании - без проверки */}
        <div style={{ position: 'relative' }}>
          <ButtonCard
            icon="🏢"
            title="Мои компании / Рабочие области"
            description="Управление компаниями"
            href="/companies"
            color="#6f42c1"
            cardId="companies"
            isHighlighted={highlightedCard === 'companies'}
            onHighlight={setHighlightedCard}
            onShowTooltip={setTooltip}
          />
        </div>

        {/* Задачи - с проверкой */}
        <div style={{ position: 'relative' }}>
          <ButtonCard
            icon="📋"
            title="Задачи"
            description={`Отслеживание задач${selectedCompanyName ? `\n🏢 ${selectedCompanyName}` : ''}${selectedProjectName ? `\n📁 ${selectedProjectName}` : ''}`}
            href="/tasks/views"
            color="#28a745"
            cardId="tasks"
            checkAvailability={checkTasksAvailability}
            isHighlighted={highlightedCard === 'tasks'}
            onHighlight={setHighlightedCard}
            onShowTooltip={setTooltip}
          />
          {tooltip && highlightedCard === 'tasks' && <Tooltip message={tooltip} position="top" />}
        </div>

        {/* Сотрудники - с проверкой */}
        <div style={{ position: 'relative' }}>
          <ButtonCard
            icon="👨‍💼"
            title="Сотрудники"
            description={`Список сотрудников${selectedCompanyName ? `\n🏢 ${selectedCompanyName}` : ''}`}
            href="/employees"
            color="#fd7e14"
            cardId="employees"
            checkAvailability={checkEmployeesAvailability}
            isHighlighted={highlightedCard === 'employees'}
            onHighlight={setHighlightedCard}
            onShowTooltip={setTooltip}
          />
          {tooltip && highlightedCard === 'employees' && <Tooltip message={tooltip} position="top" />}
        </div>

        {/* Проекты - с проверкой */}
        <div style={{ position: 'relative' }}>
          <ButtonCard
            icon="📁"
            title="Проекты"
            description={`Управление проектами${selectedProjectsCompanyName ? `\n🏢 ${selectedProjectsCompanyName}` : ''}`}
            href="/projects"
            color="#17a2b8"
            cardId="projects"
            checkAvailability={checkProjectsAvailability}
            isHighlighted={highlightedCard === 'projects'}
            onHighlight={setHighlightedCard}
            onShowTooltip={setTooltip}
          />
          {tooltip && highlightedCard === 'projects' && <Tooltip message={tooltip} position="top" />}
        </div>

        {/* Шаблоны - без проверки */}
        <div style={{ position: 'relative' }}>
          <ButtonCard
            icon="📝"
            title="Шаблоны процессов"
            description="Управление шаблонами"
            href="/templates"
            color="#20c997"
            cardId="templates"
            isHighlighted={highlightedCard === 'templates'}
            onHighlight={setHighlightedCard}
            onShowTooltip={setTooltip}
          />
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
