'use client';

import { useEffect, useState } from 'react';
import { addProject } from '../actions';
import ButtonSave from '@/components/ButtonSave';
import ButtonCancel from '@/components/ButtonCancel';

interface Company {
  id: number;
  companyName: string;
}

interface Template {
  id: number;
  templName: string;
}

interface AddProjectFormProps {
  companies: Company[];
  templates: Template[];
  defaultCompanyId?: number;
}

export default function AddProjectForm({ companies, templates, defaultCompanyId }: AddProjectFormProps) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<number>(defaultCompanyId || 0);

  // Восстанавливаем выбранную компанию из localStorage при монтировании компонента
  useEffect(() => {
    const savedCompanyId = localStorage.getItem('selectedCompanyId_projects');
    if (savedCompanyId) {
      const companyId = parseInt(savedCompanyId, 10);
      // Проверяем, что компания существует в списке доступных компаний
      if (companyId === 0 || companies.some(c => c.id === companyId)) {
        setSelectedCompanyId(companyId === 0 ? (defaultCompanyId || 0) : companyId);
      }
    }
  }, [companies, defaultCompanyId]);

  return (
    <form action={addProject} style={{ 
      backgroundColor: '#f8f9fa', 
      padding: 32, 
      borderRadius: 8, 
      border: '1px solid #dee2e6' 
    }}>
      {/* Название проекта и Компания в одной строке */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <label htmlFor="projectName" style={{ 
            display: 'block', 
            marginBottom: 8, 
            fontWeight: 'bold',
            color: '#333'
          }}>
            Название проекта *
          </label>
          <input
            type="text"
            id="projectName"
            name="projectName"
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            placeholder="Введите название проекта"
          />
        </div>

        <div style={{ flex: 1 }}>
          <label htmlFor="companyId" style={{ 
            display: 'block', 
            marginBottom: 8, 
            fontWeight: 'bold',
            color: '#333'
          }}>
            Компания *
          </label>
          <select
            id="companyId"
            name="companyId"
            required
            value={selectedCompanyId || ''}
            onChange={(e) => setSelectedCompanyId(Number(e.target.value))}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          >
            <option value="">Выберите компанию</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.companyName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label htmlFor="description" style={{ 
          display: 'block', 
          marginBottom: 8, 
          fontWeight: 'bold',
          color: '#333'
        }}>
          Описание
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: 4,
            fontSize: '16px',
            boxSizing: 'border-box',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
          placeholder="Введите описание проекта"
        />
      </div>

      <div style={{ marginBottom: 32 }}>
        <label htmlFor="statusSource" style={{ 
          display: 'block', 
          marginBottom: 8, 
          fontWeight: 'bold',
          color: '#333'
        }}>
          Шаблон шагов процесса (статусы задач) *
        </label>
        <select
          id="statusSource"
          name="statusSource"
          required
          defaultValue="default"
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: 4,
            fontSize: '16px',
            boxSizing: 'border-box', cursor: 'pointer'
          }}
        >
          <option value="default">📋 Стандартные шаги (Идея → Готово к взятию → В работе → Тестирование → Готово)</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              📝 Из шаблона: {template.templName}
            </option>
          ))}
        </select>
        <div style={{ 
          fontSize: '14px', 
          color: '#6c757d', 
          marginTop: '8px' 
        }}>
          💡 Стандартные шаги подходят для большинства проектов. Вы также можете выбрать готовый шаблон статусов или создать свой собственный в разделе "Шаблоны".
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
        <ButtonCancel />
        <ButtonSave />
      </div>
    </form>
  );
}