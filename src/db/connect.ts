import sql from 'mssql';

// Проверяем наличие обязательных переменных окружения
if (!process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_SERVER || (!process.env.DB_NAME && !process.env.DB_DATABASE)) {
  throw new Error('Отсутствуют обязательные переменные окружения: DB_USER, DB_PASSWORD, DB_SERVER, DB_NAME (или DB_DATABASE)');
}

const config: sql.config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME || process.env.DB_DATABASE,
    options: {
        encrypt: false, // Для локального сервера
        trustServerCertificate: true,
        enableArithAbort: true,
        cancelTimeout: 5000,
    },
    port: parseInt(process.env.DB_PORT || '1433'),
    requestTimeout: 30000,
    connectionTimeout: 30000,
    // Настройки пула соединений
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
        acquireTimeoutMillis: 60000,
        createTimeoutMillis: 30000,
        destroyTimeoutMillis: 5000,
        createRetryIntervalMillis: 200,
    }
};

let pool: sql.ConnectionPool | null = null;
let isConnecting = false;

// Функция для получения или создания пула соединений
async function getPool(): Promise<sql.ConnectionPool> {
  // Если пул уже существует и подключен, используем его
  if (pool && pool.connected) {
    return pool;
  }

  // Если уже идет процесс подключения, ждем его завершения
  if (isConnecting) {
    while (isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (pool && pool.connected) {
      return pool;
    }
  }

  isConnecting = true;
  
  try {
    console.log('Создаем новое подключение к базе данных...');
    
    // Закрываем предыдущий пул, если он существует
    if (pool) {
      try {
        await pool.close();
      } catch (e) {
        console.log('Ошибка при закрытии старого пула:', e);
      }
    }

    pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('Подключение к базе данных установлено');
    
    // Обработка ошибок пула
    pool.on('error', (err) => {
      console.error('Ошибка пула соединений:', err);
      pool = null;
    });

    return pool;
  } finally {
    isConnecting = false;
  }
}

export async function connectDB(): Promise<sql.ConnectionPool> {
  return await getPool();
}

export async function getConnection(): Promise<sql.ConnectionPool> {
  return await getPool();
}

// Универсальная функция для выполнения запросов
export async function query(queryText: string, params: any = {}): Promise<any[]> {
  let connection: sql.ConnectionPool | null = null;
  
  try {
    // Используем переиспользуемый пул соединений
    connection = await getPool();
    
    // Создаем новый запрос
    const request = connection.request();
    
    // Добавляем параметры в запрос с явной типизацией
    Object.keys(params).forEach(key => {
      const value = params[key];
      
      // Специальная обработка для разных типов данных
      if (value === null || value === undefined) {
        request.input(key, sql.NVarChar, null);
      } else if (typeof value === 'number') {
        request.input(key, sql.Int, value);
      } else if (typeof value === 'string') {
        // Проверяем, является ли строка датой
        if (key.includes('Date') || key === 'dedline') {
          if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
            request.input(key, sql.Date, value);
          } else {
            request.input(key, sql.NVarChar, value);
          }
        } else {
          request.input(key, sql.NVarChar, value);
        }
      } else if (value instanceof Date) {
        request.input(key, sql.DateTime, value);
      } else {
        request.input(key, value); // Автоматическое определение типа
      }
    });
    
    const result = await request.query(queryText);
    
    return result.recordset || [];
    
  } catch (error: any) {
    console.error('Ошибка выполнения запроса:', error?.message || error);
    console.error('Запрос:', queryText);
    console.error('Параметры:', params);
    throw error;
  }
  // НЕ закрываем соединение - оно переиспользуется
}

// Функция для закрытия пула соединений
export async function closeConnection(): Promise<void> {
  if (pool) {
    try {
      await pool.close();
      console.log('Пул соединений закрыт');
    } catch (closeError) {
      console.log('Ошибка при закрытии пула:', closeError);
    } finally {
      pool = null;
    }
  }
}

// Экспортируем sql для использования типов и методов
export { sql };
