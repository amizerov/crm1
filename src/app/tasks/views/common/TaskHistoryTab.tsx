'use client';

interface TaskHistoryTabProps {
  taskId: number;
}

export default function TaskHistoryTab({ taskId }: TaskHistoryTabProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
      <div className="text-6xl mb-4">🕐</div>
      <h3 className="text-lg font-medium mb-2">История изменений</h3>
      <p className="text-sm">Функционал в разработке...</p>
      <p className="text-xs mt-2 text-gray-400">Скоро здесь будет отображаться история всех изменений задачи</p>
    </div>
  );
}
