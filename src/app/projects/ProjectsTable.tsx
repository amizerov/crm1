'use client';

import { useRouter } from 'next/navigation';
import TableBase, { Column } from '@/components/TableBase';

export type Project = {
  id: number;
  projectName: string;
  description?: string;
  companyId: number;
  userId: number;
  companyName?: string;
  userNicName?: string;
  userFullName?: string;
  dtc: string;
  dtu?: string;
};

interface ProjectsTableProps {
  projects: Project[];
  isPending?: boolean;
}

export default function ProjectsTable({ projects, isPending = false }: ProjectsTableProps) {
  const router = useRouter();

  const columns: Column<Project>[] = [
    {
      key: 'id',
      label: 'ID',
      className: 'w-16 font-mono text-center'
    },
    {
      key: 'projectName',
      label: 'Название проекта'
    },
    {
      key: 'description',
      label: 'Описание',
      render: (project) => project.description || '-'
    },
    {
      key: 'companyName',
      label: 'Компания',
      render: (project) => project.companyName || '-'
    },
    {
      key: 'userNicName',
      label: 'Создатель',
      render: (project) => project.userNicName || project.userFullName || '-'
    },
    {
      key: 'dtc',
      label: 'Дата создания',
      className: 'font-mono',
      render: (project) => {
        if (!project.dtc) return '-';
        const date = new Date(project.dtc);
        return date.toLocaleDateString('ru-RU');
      }
    },
    {
      key: 'dtu',
      label: 'Обновлено',
      className: 'font-mono',
      render: (project) => {
        if (!project.dtu) return '-';
        const date = new Date(project.dtu);
        return date.toLocaleDateString('ru-RU');
      }
    }
  ];

  const handleRowClick = (project: Project) => {
    router.push(`/projects/edit/${project.id}`);
  };

  return (
    <TableBase
      data={projects}
      columns={columns}
      onRowClick={handleRowClick}
      loading={isPending}
      emptyMessage="Проекты не найдены"
      addButtonText="Добавить первый проект"
      addButtonLink="/projects/add"
    />
  );
}
