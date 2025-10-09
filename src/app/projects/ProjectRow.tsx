'use client';

import { useRouter } from 'next/navigation';
import type { Project } from './ProjectsTable';

interface ProjectRowProps {
  project: Project;
}

export default function ProjectRow({ project }: ProjectRowProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/projects/edit/${project.id}`);
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Обрезаем описание, если оно слишком длинное
  const truncateDescription = (text?: string, maxLength: number = 100) => {
    if (!text) return '—';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <tr 
      onClick={handleClick}
      style={{ 
        borderBottom: '1px solid #dee2e6',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#f1f3f5';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'white';
      }}
    >
      <td style={{ padding: 16, color: '#495057' }}>{project.id}</td>
      <td style={{ padding: 16, fontWeight: 'bold', color: '#212529' }}>{project.projectName}</td>
      <td style={{ padding: 16, color: '#6c757d', fontSize: 14 }}>
        {truncateDescription(project.description)}
      </td>
      <td style={{ padding: 16, color: '#495057' }}>{project.companyName || '—'}</td>
      <td style={{ padding: 16, color: '#495057' }}>
        {project.userNicName || project.userFullName || '—'}
      </td>
      <td style={{ padding: 16, color: '#6c757d', fontSize: 14 }}>
        {formatDate(project.dtc)}
      </td>
      <td style={{ padding: 16, color: '#6c757d', fontSize: 14 }}>
        {project.dtu ? formatDate(project.dtu) : '—'}
      </td>
    </tr>
  );
}
