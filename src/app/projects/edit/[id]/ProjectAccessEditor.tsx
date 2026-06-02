'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProjectAccess } from './actions';
import type { ProjectAccessEmployee } from './actions';

interface ProjectAccessEditorProps {
  projectId: number;
  employees: ProjectAccessEmployee[];
}

export default function ProjectAccessEditor({ projectId, employees }: ProjectAccessEditorProps) {
  const router = useRouter();
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>(
    employees.filter((employee) => employee.hasAccess).map((employee) => employee.id)
  );
  const [search, setSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const selectedSet = useMemo(() => new Set(selectedEmployeeIds), [selectedEmployeeIds]);
  const filteredEmployees = employees.filter((employee) => (
    employee.displayName.toLowerCase().includes(search.trim().toLowerCase())
  ));

  const toggleEmployee = (employeeId: number) => {
    setSelectedEmployeeIds((current) => (
      current.includes(employeeId)
        ? current.filter((id) => id !== employeeId)
        : [...current, employeeId]
    ));
  };

  const selectAll = () => {
    setSelectedEmployeeIds(employees.map((employee) => employee.id));
  };

  const clearAll = () => {
    setSelectedEmployeeIds([]);
  };

  const saveAccess = async () => {
    try {
      setIsSaving(true);
      const result = await updateProjectAccess(projectId, selectedEmployeeIds);

      if (!result.success) {
        alert(result.error || 'Не удалось сохранить доступы');
        return;
      }

      router.refresh();
    } catch (error) {
      console.error('Ошибка сохранения доступов:', error);
      alert('Не удалось сохранить доступы');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Доступ сотрудников
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Сотрудник с доступом может работать с проектом без дополнительных ролей.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            disabled={isSaving || employees.length === 0}
            className="px-3 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Выбрать всех
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={isSaving || selectedEmployeeIds.length === 0}
            className="px-3 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Снять всех
          </button>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Найти сотрудника"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {employees.length === 0 ? (
        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
          В компании проекта нет сотрудников.
        </div>
      ) : (
        <div className="space-y-2 max-h-[480px] overflow-auto pr-1">
          {filteredEmployees.map((employee) => (
            <label
              key={employee.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-pointer dark:border-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              <input
                type="checkbox"
                checked={selectedSet.has(employee.id)}
                onChange={() => toggleEmployee(employee.id)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {employee.displayName}
              </span>
            </label>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 mt-6">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Выбрано: {selectedEmployeeIds.length} из {employees.length}
        </div>
        <button
          type="button"
          onClick={saveAccess}
          disabled={isSaving}
          className="px-5 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Сохранение...' : 'Сохранить доступы'}
        </button>
      </div>
    </div>
  );
}
