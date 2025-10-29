export default function Footer() {
  // Фиксированная дата сборки (устанавливается при билде)
  const buildDate = process.env.BUILD_DATE;
  const version = process.env.npm_package_version;
  const buildNumber = process.env.BUILD_NUMBER;

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center text-sm text-gray-600 dark:text-gray-400 relative">
        <div>
          © 2025 Argo CRM. Все права защищены.
        </div>
        <div className="text-xs absolute right-0">
          v {version} • {buildNumber} • {buildDate}
        </div>
      </div>
    </footer>
  );
}