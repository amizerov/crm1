'use client';

import { updateProject } from '../../actions/actions';
import type { Project } from '../../actions/actions';
import FormPageLayout from '@/components/FormPageLayout';
import FormContainer from '@/components/FormContainer';
import FormFieldStandard from '@/components/FormFieldStandard';
import { StandardInput, StandardSelect, StandardTextarea } from '@/components/StandardInputs';
import ButtonBack from '@/components/ButtonBack';
import ButtonDelete from '@/components/ButtonDelete';
import ButtonCancel from '@/components/ButtonCancel';
import ButtonSave from '@/components/ButtonSave';
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
        useGrid={true}
        buttons={
          <>
            <ButtonDelete
              confirmTitle="Удалить проект?"
              confirmMessage="Вы уверены, что хотите удалить этот проект? Это действие нельзя отменить."
              deleteAction={deleteProject.bind(null, project.id)}
              redirectTo="/projects"
            />
            <div className="flex-1" />
            <ButtonCancel />
            <ButtonSave />
          </>
        }
      >
        <input type="hidden" name="id" value={project.id} />
        
        {/* Название проекта и Компания */}
        <FormFieldStandard label="Название проекта" required>
          <StandardInput
            type="text"
            id="projectName"
            name="projectName"
            required
            defaultValue={project.projectName}
            placeholder="Введите название проекта"
          />
        </FormFieldStandard>

        <FormFieldStandard label="Компания" required>
          <StandardSelect
            id="companyId"
            name="companyId"
            required
            defaultValue={project.companyId}
          >
            <option value="">Выберите компанию</option>
            {companies.map(company => (
              <option key={company.id} value={company.id}>
                {company.companyName}
              </option>
            ))}
          </StandardSelect>
        </FormFieldStandard>

        <FormFieldStandard label="Описание" className="col-span-full">
          <StandardTextarea
            id="description"
            name="description"
            rows={4}
            defaultValue={project.description || ''}
            placeholder="Введите описание проекта"
          />
        </FormFieldStandard>

        <FormFieldStandard label="Информация о проекте" className="col-span-full" isLast>
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              <strong>Создатель:</strong> {project.userNicName || project.userFullName || '—'}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              <strong>Дата создания:</strong> {new Date(project.dtc).toLocaleString('ru-RU')}
            </div>
            {project.dtu && (
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Последнее обновление:</strong> {new Date(project.dtu).toLocaleString('ru-RU')}
              </div>
            )}
          </div>
        </FormFieldStandard>
      </FormContainer>
    </FormPageLayout>
  );
}
