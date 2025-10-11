'use client';

import { useEffect, useState } from 'react';
import { addProject } from '../actions';
import ButtonSave from '@/components/ButtonSave';
import ButtonCancel from '@/components/ButtonCancel';
import FormContainer from '@/components/FormContainer';
import FormFieldStandard from '@/components/FormFieldStandard';
import { COMPONENT_STYLES } from '@/styles/constants';

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
    const savedCompanyId = localStorage.getItem('selectedCompanyId');
    if (savedCompanyId) {
      const companyId = parseInt(savedCompanyId, 10);
      // Проверяем, что компания существует в списке доступных компаний
      if (companyId === 0 || companies.some(c => c.id === companyId)) {
        setSelectedCompanyId(companyId === 0 ? (defaultCompanyId || 0) : companyId);
      }
    }
  }, [companies, defaultCompanyId]);

  return (
    <FormContainer 
      action={addProject}
      useGrid={true}
      buttons={
        <>
          <ButtonCancel />
          <ButtonSave />
        </>
      }
    >
      {/* Название проекта */}
      <FormFieldStandard label="Название проекта" required>
        <input
          type="text"
          id="projectName"
          name="projectName"
          required
          style={COMPONENT_STYLES.input}
          placeholder="Введите название проекта"
        />
      </FormFieldStandard>

      {/* Компания */}
      <FormFieldStandard label="Компания" required>
        <select
          id="companyId"
          name="companyId"
          required
          value={selectedCompanyId || ''}
          onChange={(e) => setSelectedCompanyId(Number(e.target.value))}
          style={COMPONENT_STYLES.input}
        >
          <option value="">Выберите компанию</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.companyName}
            </option>
          ))}
        </select>
      </FormFieldStandard>

      {/* Описание на полную ширину */}
      <FormFieldStandard label="Описание" style={{ gridColumn: '1 / -1' }}>
        <textarea
          id="description"
          name="description"
          rows={4}
          style={{
            ...COMPONENT_STYLES.input,
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
          placeholder="Введите описание проекта"
        />
      </FormFieldStandard>

      {/* Шаблон статусов на полную ширину */}
      <FormFieldStandard label="Шаблон шагов процесса (статусы задач)" required style={{ gridColumn: '1 / -1' }}>
        <select
          id="statusSource"
          name="statusSource"
          required
          defaultValue="default"
          style={{
            ...COMPONENT_STYLES.input,
            cursor: 'pointer'
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
      </FormFieldStandard>
    </FormContainer>
  );
}