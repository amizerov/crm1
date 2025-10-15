interface StatCardProps {
  label: string;
  value: string | number;
  variant?: 'default' | 'success' | 'info';
}

export default function StatCard({ label, value, variant = 'default' }: StatCardProps) {
  const variantClasses = {
    default: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
  };

  return (
    <div className={`px-4 py-2 rounded border ${variantClasses[variant]}`}>
      <span className="text-sm font-bold">
        {label}: {typeof value === 'number' ? value.toLocaleString('ru-RU') : value}
        {typeof value === 'number' && label.includes('сумма') && ' ₽'}
      </span>
    </div>
  );
}