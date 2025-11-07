'use client';

import { useState } from 'react';
import { migrateProjectDocuments, MigrationResult } from '../actions/migrateDocuments';

export default function DocumentsMigration() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);

  const handleMigrate = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setResult(null);

    try {
      const migrationResult = await migrateProjectDocuments();
      setResult(migrationResult);
    } catch (error) {
      console.error('Ошибка миграции:', error);
      setResult({
        success: false,
        message: 'Ошибка выполнения миграции',
        processed: 0,
        skipped: 0,
        errors: 1,
        details: ['❌ Критическая ошибка']
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Миграция документов проектов
        </h2>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Этот инструмент найдет все файлы в папках <code>public/media/p{'{projectId}'}/</code> 
            и зарегистрирует их в таблице <code>ProjectDocuments</code>.
          </p>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Важно:</h4>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• Будут обработаны только файлы в корне папок проектов</li>
              <li>• Документы задач (в подпапках t{'{taskId}'}) будут пропущены</li>
              <li>• Уже зарегистрированные файлы будут пропущены</li>
              <li>• Всем файлам будет назначен текущий пользователь как загрузивший</li>
            </ul>
          </div>
        </div>

        <button
          onClick={handleMigrate}
          disabled={isRunning}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isRunning ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Выполняется миграция...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Запустить миграцию
            </>
          )}
        </button>

        {result && (
          <div className={`mt-6 p-4 rounded-lg border ${
            result.success 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <h3 className={`font-medium mb-2 ${
              result.success 
                ? 'text-green-800 dark:text-green-200' 
                : 'text-red-800 dark:text-red-200'
            }`}>
              {result.success ? '✅ Миграция завершена' : '❌ Ошибка миграции'}
            </h3>
            
            <p className={`mb-4 ${
              result.success 
                ? 'text-green-700 dark:text-green-300' 
                : 'text-red-700 dark:text-red-300'
            }`}>
              {result.message}
            </p>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {result.processed}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Обработано</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {result.skipped}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Пропущено</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {result.errors}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Ошибок</div>
              </div>
            </div>

            {result.details.length > 0 && (
              <details className="mt-4">
                <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
                  Подробности ({result.details.length} записей)
                </summary>
                <div className="mt-2 max-h-64 overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded p-3">
                  {result.details.map((detail, index) => (
                    <div key={index} className="text-sm font-mono text-gray-600 dark:text-gray-400 mb-1">
                      {detail}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}