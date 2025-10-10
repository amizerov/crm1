'use client';

import { updateProject } from '../../actions';
import Link from 'next/link';
import type { Project } from '../../actions';
import DelBtn from './DelBtn';
import ButtonCancel from '@/components/ButtonCancel';
import ButtonSave from '@/components/ButtonSave';

interface ProjectFormProps {
  project: Project;
  companies: { id: number; companyName: string }[];
}

export default function ProjectForm({ project, companies }: ProjectFormProps) {
  return (
    <form action={updateProject} style={{ 
      backgroundColor: '#f8f9fa', 
      padding: 32, 
      borderRadius: 8, 
      border: '1px solid #dee2e6' 
    }}>
      <input type="hidden" name="id" value={project.id} />
      
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
            defaultValue={project.projectName}
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
            defaultValue={project.companyId}
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
            {companies.map(company => (
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
          defaultValue={project.description || ''}
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

      <div style={{ 
        marginBottom: 24,
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

      <div style={{ display: 'flex', gap: 16, justifyContent: 'space-between' }}>
        <DelBtn projectId={project.id} />
        <div style={{ display: 'flex', gap: 16 }}>
          <ButtonCancel />
          <ButtonSave />
        </div>
      </div>
    </form>
  );
}
