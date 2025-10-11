'use client';

import { updateProject } from '../../actions';
import type { Project } from '../../actions';
import FormPageLayout from '@/components/FormPageLayout';
import FormContainer from '@/components/FormContainer';
import FormFieldStandard from '@/components/FormFieldStandard';
import ButtonBack from '@/components/ButtonBack';
import ButtonDelete from '@/components/ButtonDelete';
import ButtonCancel from '@/components/ButtonCancel';
import ButtonSave from '@/components/ButtonSave';
import { COMPONENT_STYLES } from '@/styles/constants';
import { deleteProject } from './actions';

interface ProjectFormProps {
  project: Project;
  companies: { id: number; companyName: string }[];
}

export default function ProjectForm({ project, companies }: ProjectFormProps) {
  return (
    <FormPageLayout
      title="Редактирование проекта"
      subtitle={`Изменение данных проекта "${project.projectName}" (ID: ${project.id})`}
      actionButton={<ButtonBack />}
    >
      <FormContainer
        action={updateProject}
        buttons={
          <div style={{ display: 'flex', gap: 16, justifyContent: 'space-between', width: '100%' }}>
            <ButtonDelete
              confirmTitle="Удалить проект?"
              confirmMessage="Вы уверены, что хотите удалить этот проект? Это действие нельзя отменить."
              deleteAction={deleteProject.bind(null, project.id)}
              redirectTo="/projects"
            />
            <div style={{ display: 'flex', gap: 16 }}>
              <ButtonCancel />
              <ButtonSave />
            </div>
          </div>
        }
      >
        <input type="hidden" name="id" value={project.id} />
        
        {/* Название проекта и Компания в одной строке */}
        <div style={{ display: 'flex', gap: 16 }}>
          <FormFieldStandard label="Название проекта" required style={{ flex: 1 }}>
            <input
              type="text"
              id="projectName"
              name="projectName"
              required
              defaultValue={project.projectName}
              style={COMPONENT_STYLES.input}
              placeholder="Введите название проекта"
            />
          </FormFieldStandard>

          <FormFieldStandard label="Компания" required style={{ flex: 1 }}>
            <select
              id="companyId"
              name="companyId"
              required
              defaultValue={project.companyId}
              style={COMPONENT_STYLES.input}
            >
              <option value="">Выберите компанию</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.companyName}
                </option>
              ))}
            </select>
          </FormFieldStandard>
        </div>

        <FormFieldStandard label="Описание">
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={project.description || ''}
            style={{
              ...COMPONENT_STYLES.input,
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
            placeholder="Введите описание проекта"
          />
        </FormFieldStandard>

        <FormFieldStandard label="Информация о проекте" isLast>
          <div style={{ 
            padding: 16,
            backgroundColor: '#e9ecef',
            borderRadius: 4
          }}>
            <div style={{ fontSize: 14, color: '#495057', marginBottom: 8 }}>
              <strong>Создатель:</strong> {project.userNicName || project.userFullName || '—'}
            </div>
            <div style={{ fontSize: 14, color: '#495057', marginBottom: 8 }}>
              <strong>Дата создания:</strong> {new Date(project.dtc).toLocaleString('ru-RU')}
            </div>
            {project.dtu && (
              <div style={{ fontSize: 14, color: '#495057' }}>
                <strong>Последнее обновление:</strong> {new Date(project.dtu).toLocaleString('ru-RU')}
              </div>
            )}
          </div>
        </FormFieldStandard>
      </FormContainer>
    </FormPageLayout>
  );
}
