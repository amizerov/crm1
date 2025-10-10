export const getPriorityColor = (priorityName?: string) => {
  switch(priorityName) {
    case 'Низкий': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'Средний': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'Высокий': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'Срочный': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'Караул': return 'bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold animate-pulse shadow-lg border-2 border-red-600';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};

export const formatDate = (dateStr?: string) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
};