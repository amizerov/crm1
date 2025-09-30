'use client';

import { useState } from 'react';

interface CompanyData {
  ЮЛ?: {
    ИНН?: string;
    КПП?: string;
    ОГРН?: string;
    ДатаОГРН?: string;
    ДатаРег?: string;
    ОКОПФ?: string;
    КодОКОПФ?: string;
    Статус?: string;
    СпОбрЮЛ?: string;
    НО?: {
      Рег?: string;
      РегДата?: string;
      Учет?: string;
      УчетДата?: string;
    };
    ПФ?: {
      РегНомПФ?: string;
      ДатаРегПФ?: string;
      КодПФ?: string;
    };
    ФСС?: {
      РегНомФСС?: string;
      ДатаРегФСС?: string;
      КодФСС?: string;
    };
    КодыСтат?: {
      ОКПО?: string;
      ОКТМО?: string;
      ОКФС?: string;
      ОКОГУ?: string;
    };
    Капитал?: {
      ВидКап?: string;
      СумКап?: string;
      Дата?: string;
    };
    НаимСокрЮЛ?: string;
    НаимПолнЮЛ?: string;
    Адрес?: {
      КодРегион?: string;
      КодКЛАДР?: string;
      Индекс?: string;
      АдресПолн?: string;
      АдресДетали?: {
        Регион?: {
          Тип?: string;
          Наим?: string;
        };
        Улица?: {
          Тип?: string;
          Наим?: string;
        };
        Дом?: string;
        Корпус?: string;
        Помещ?: string;
      };
      Дата?: string;
    };
    Руководитель?: {
      ВидДолжн?: string;
      Должн?: string;
      ФИОПолн?: string;
      ИННФЛ?: string;
      Пол?: string;
      ВидГражд?: string;
      Дата?: string;
    };
    Учредители?: Array<{
      УчрФЛ?: {
        ФИОПолн?: string;
        ИННФЛ?: string;
        Пол?: string;
        ВидГражд?: string;
      };
      СуммаУК?: string;
      Процент?: string;
      Дата?: string;
    }>;
    Контакты?: {
      Телефон?: string[];
    };
    ОснВидДеят?: {
      Код?: string;
      Текст?: string;
      Дата?: string;
    };
    ДопВидДеят?: Array<{
      Код?: string;
      Текст?: string;
      Дата?: string;
    }>;
    ОткрСведения?: {
      КолРаб?: string;
      СведСНР?: string;
      ПризнУчКГН?: string;
      СумДоход?: string;
      СумРасход?: string;
      Дата?: string;
    };
    [key: string]: any;
  };
  [key: string]: any;
}

export default function TestInnPage() {
  const [inn, setInn] = useState('7736524285');
  const [data, setData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanyData = async () => {
    if (!inn) {
      setError('Введите ИНН');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://crm.argoai.ru/api/company/${inn}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Полученные данные:', result);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (data: CompanyData) => {
    const company = data.ЮЛ;
    if (!company) return 'Данные не найдены';
    
    if (company.Адрес?.АдресПолн) return company.Адрес.АдресПолн;
    
    // Собираем адрес из частей
    const parts = [];
    if (company.Адрес?.Индекс) parts.push(company.Адрес.Индекс);
    if (company.Адрес?.АдресДетали?.Регион?.Наим) {
      parts.push(`${company.Адрес.АдресДетали.Регион.Тип || ''} ${company.Адрес.АдресДетали.Регион.Наим}`.trim());
    }
    if (company.Адрес?.АдресДетали?.Улица?.Наим) {
      parts.push(`${company.Адрес.АдресДетали.Улица.Тип || ''} ${company.Адрес.АдресДетали.Улица.Наим}`.trim());
    }
    if (company.Адрес?.АдресДетали?.Дом) parts.push(company.Адрес.АдресДетали.Дом);
    if (company.Адрес?.АдресДетали?.Корпус) parts.push(company.Адрес.АдресДетали.Корпус);
    if (company.Адрес?.АдресДетали?.Помещ) parts.push(company.Адрес.АдресДетали.Помещ);
    
    return parts.length > 0 ? parts.join(', ') : 'Адрес не найден';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Тест получения данных по ИНН</h1>
      
      {/* Форма поиска */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="inn" className="block text-sm font-medium text-gray-700 mb-2">
              ИНН компании
            </label>
            <input
              type="text"
              id="inn"
              value={inn}
              onChange={(e) => setInn(e.target.value)}
              placeholder="Введите ИНН (например: 7736524285)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={fetchCompanyData}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Загрузка...
              </>
            ) : (
              <>
                🔍 Получить данные
              </>
            )}
          </button>
        </div>
      </div>

      {/* Ошибка */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          <strong>Ошибка:</strong> {error}
        </div>
      )}

      {/* Результат */}
      {data && data.ЮЛ && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Информация о компании</h2>
          
          {/* Основная информация */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-medium mb-3 text-blue-600">Основные данные</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Полное наименование:</span>
                  <p className="text-gray-700">{data.ЮЛ.НаимПолнЮЛ || 'Не указано'}</p>
                </div>
                <div>
                  <span className="font-medium">Краткое наименование:</span>
                  <p className="text-gray-700">{data.ЮЛ.НаимСокрЮЛ || 'Не указано'}</p>
                </div>
                <div>
                  <span className="font-medium">ИНН:</span>
                  <p className="text-gray-700 font-mono">{data.ЮЛ.ИНН || 'Не указано'}</p>
                </div>
                <div>
                  <span className="font-medium">КПП:</span>
                  <p className="text-gray-700 font-mono">{data.ЮЛ.КПП || 'Не указано'}</p>
                </div>
                <div>
                  <span className="font-medium">ОГРН:</span>
                  <p className="text-gray-700 font-mono">{data.ЮЛ.ОГРН || 'Не указано'}</p>
                </div>
                <div>
                  <span className="font-medium">ОКПО:</span>
                  <p className="text-gray-700 font-mono">{data.ЮЛ.КодыСтат?.ОКПО || 'Не указано'}</p>
                </div>
                <div>
                  <span className="font-medium">ОКОПФ:</span>
                  <p className="text-gray-700">{data.ЮЛ.ОКОПФ || 'Не указано'}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3 text-green-600">Статус и даты</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Статус:</span>
                  <p className="text-gray-700">{data.ЮЛ.Статус || 'Не указано'}</p>
                </div>
                <div>
                  <span className="font-medium">Дата регистрации:</span>
                  <p className="text-gray-700">{data.ЮЛ.ДатаРег || 'Не указано'}</p>
                </div>
                <div>
                  <span className="font-medium">Дата ОГРН:</span>
                  <p className="text-gray-700">{data.ЮЛ.ДатаОГРН || 'Не указано'}</p>
                </div>
                {data.ЮЛ.НО?.РегДата && (
                  <div>
                    <span className="font-medium">Дата рег. ФНС:</span>
                    <p className="text-gray-700">{data.ЮЛ.НО.РегДата}</p>
                  </div>
                )}
                {data.ЮЛ.НО?.УчетДата && (
                  <div>
                    <span className="font-medium">Дата учета:</span>
                    <p className="text-gray-700">{data.ЮЛ.НО.УчетДата}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Руководитель */}
          {data.ЮЛ.Руководитель && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-purple-600">Руководитель</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">ФИО:</span>
                    <p className="text-gray-700">{data.ЮЛ.Руководитель.ФИОПолн || 'Не указано'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Должность:</span>
                    <p className="text-gray-700">{data.ЮЛ.Руководитель.Должн || 'Не указано'}</p>
                  </div>
                  <div>
                    <span className="font-medium">ИНН ФЛ:</span>
                    <p className="text-gray-700 font-mono">{data.ЮЛ.Руководитель.ИННФЛ || 'Не указано'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Дата назначения:</span>
                    <p className="text-gray-700">{data.ЮЛ.Руководитель.Дата || 'Не указано'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Контакты */}
          {data.ЮЛ.Контакты?.Телефон && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-orange-600">Контакты</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div>
                  <span className="font-medium">Телефоны:</span>
                  <div className="mt-1">
                    {data.ЮЛ.Контакты.Телефон.map((phone, index) => (
                      <p key={index} className="text-gray-700 font-mono">{phone}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Финансовые данные */}
          {data.ЮЛ.ОткрСведения && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-indigo-600">Открытые сведения ({data.ЮЛ.ОткрСведения.Дата})</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="font-medium">Количество работников:</span>
                    <p className="text-gray-700">{data.ЮЛ.ОткрСведения.КолРаб || 'Не указано'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Доходы:</span>
                    <p className="text-gray-700">{data.ЮЛ.ОткрСведения.СумДоход ? `${parseInt(data.ЮЛ.ОткрСведения.СумДоход).toLocaleString()} руб.` : 'Не указано'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Расходы:</span>
                    <p className="text-gray-700">{data.ЮЛ.ОткрСведения.СумРасход ? `${parseInt(data.ЮЛ.ОткрСведения.СумРасход).toLocaleString()} руб.` : 'Не указано'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Налоговый режим:</span>
                    <p className="text-gray-700">{data.ЮЛ.ОткрСведения.СведСНР || 'Не указано'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Адрес */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-purple-600">Адрес</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-gray-700">{formatAddress(data)}</p>
              {data.ЮЛ.Адрес?.Индекс && (
                <p className="text-sm text-gray-500 mt-1">Индекс: {data.ЮЛ.Адрес.Индекс}</p>
              )}
            </div>
          </div>

          {/* Raw JSON для отладки */}
          <details className="mt-6">
            <summary className="cursor-pointer text-lg font-medium text-gray-600 hover:text-gray-800">
              🔧 Показать полные данные (JSON)
            </summary>
            <pre className="mt-3 p-4 bg-gray-100 rounded-md overflow-auto text-sm">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Примеры ИНН для тестирования */}
      <div className="mt-8 bg-blue-50 p-4 rounded-md">
        <h3 className="font-medium text-blue-800 mb-2">Примеры ИНН для тестирования:</h3>
        <div className="flex flex-wrap gap-2">
          {['7736524285', '7707083893', '7702070139', '5077746887'].map((testInn) => (
            <button
              key={testInn}
              onClick={() => setInn(testInn)}
              className="px-3 py-1 bg-blue-200 text-blue-800 rounded hover:bg-blue-300 text-sm font-mono"
            >
              {testInn}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
