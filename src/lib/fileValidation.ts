/**
 * Утилиты для безопасной валидации загружаемых файлов
 * Проверка magic bytes (реального содержимого файла), а не только MIME-типа
 */

// Whitelist разрешенных типов файлов
export const ALLOWED_IMAGE_TYPES = {
  'image/jpeg': { extensions: ['.jpg', '.jpeg'], magicBytes: [[0xFF, 0xD8, 0xFF]] },
  'image/png': { extensions: ['.png'], magicBytes: [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]] },
  'image/gif': { extensions: ['.gif'], magicBytes: [[0x47, 0x49, 0x46, 0x38]] },
  'image/webp': { extensions: ['.webp'], magicBytes: [[0x52, 0x49, 0x46, 0x46]] },
};

export const ALLOWED_DOCUMENT_TYPES = {
  'application/pdf': { extensions: ['.pdf'], magicBytes: [[0x25, 0x50, 0x44, 0x46]] },
  'application/msword': { extensions: ['.doc'], magicBytes: [[0xD0, 0xCF, 0x11, 0xE0]] },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { 
    extensions: ['.docx'], 
    magicBytes: [[0x50, 0x4B, 0x03, 0x04]] 
  },
  'application/vnd.ms-excel': { extensions: ['.xls'], magicBytes: [[0xD0, 0xCF, 0x11, 0xE0]] },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { 
    extensions: ['.xlsx'], 
    magicBytes: [[0x50, 0x4B, 0x03, 0x04]] 
  },
  'text/plain': { extensions: ['.txt', '.sql'], magicBytes: [] as number[][] },
  'text/csv': { extensions: ['.csv'], magicBytes: [] as number[][] },
  'application/sql': { extensions: ['.sql'], magicBytes: [] as number[][] },
};

// Запрещенные расширения (исполняемые файлы)
const BLOCKED_EXTENSIONS = [
  // Windows исполняемые
  '.exe', '.dll', '.bat', '.cmd', '.com', '.pif', '.scr', '.msi', '.msp',
  '.application', '.gadget', '.cpl', '.msc', '.vbs', '.vbe', '.wsf', '.wsh',
  '.ps1', '.ps2', '.psc1', '.psc2', '.psm1', '.lnk', '.inf', '.reg',
  // Linux/Unix исполняемые
  '.sh', '.bash', '.zsh', '.fish', '.csh', '.tcsh', '.ksh', '.run', '.bin',
  '.app', '.deb', '.rpm', '.dmg', '.pkg', '.appimage', '.snap',
  // Java/JVM
  '.jar', '.war', '.ear', '.class', '.jnlp',
  // Веб/скрипты (могут быть опасны)
  '.js', '.jse', '.jsx', '.mjs', '.ts', '.tsx',
  '.php', '.phtml', '.php3', '.php4', '.php5', '.phps',
  '.asp', '.aspx', '.cer', '.csr',
  // Другие опасные
  '.hta', '.chm', '.iso', '.img', '.vhd', '.vhdx',
  '.sys', '.drv', '.ocx', '.ax',
  // Исходный код (может содержать вредоносный код)
  '.py', '.rb', '.pl', '.lua', '.go', '.rs', '.c', '.cpp', '.h',
  '.pas', '.dpr', // Pascal/Delphi (как у вас был найден .pas файл!)
];

/**
 * Проверка magic bytes файла
 */
function checkMagicBytes(buffer: Buffer, allowedMagicBytes: number[][]): boolean {
  if (allowedMagicBytes.length === 0) {
    return true; // Для типов без magic bytes (txt, csv)
  }

  return allowedMagicBytes.some(magicBytes => {
    if (buffer.length < magicBytes.length) {
      return false;
    }
    return magicBytes.every((byte, index) => buffer[index] === byte);
  });
}

/**
 * Проверка расширения файла
 */
function checkExtension(fileName: string, allowedExtensions: string[]): boolean {
  const extension = fileName.toLowerCase().split('.').pop();
  if (!extension) return false;
  
  return allowedExtensions.some(ext => ext.toLowerCase() === `.${extension}`);
}

/**
 * Проверка на запрещенные расширения
 */
function isBlockedExtension(fileName: string): boolean {
  const lowerName = fileName.toLowerCase();
  
  // Проверка основного расширения
  const extension = lowerName.split('.').pop();
  if (!extension) return false;
  
  if (BLOCKED_EXTENSIONS.includes(`.${extension}`)) {
    return true;
  }
  
  // КРИТИЧНО: Проверка двойных расширений (file.pdf.exe)
  const parts = lowerName.split('.');
  if (parts.length > 2) {
    for (let i = 1; i < parts.length; i++) {
      if (BLOCKED_EXTENSIONS.includes(`.${parts[i]}`)) {
        return true;
      }
    }
  }
  
  // Проверка на null byte injection (file.pdf%00.exe)
  if (fileName.includes('\0') || fileName.includes('%00')) {
    return true;
  }
  
  return false;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Валидация изображения
 */
export async function validateImageFile(
  file: File,
  maxSizeBytes: number = 5 * 1024 * 1024 // 5MB по умолчанию
): Promise<FileValidationResult> {
  // 1. Проверка размера
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `Размер файла не должен превышать ${Math.round(maxSizeBytes / 1024 / 1024)} МБ`,
    };
  }

  // 2. Проверка на запрещенные расширения
  if (isBlockedExtension(file.name)) {
    return {
      valid: false,
      error: 'Загрузка исполняемых файлов запрещена',
    };
  }

  // 3. Проверка MIME-типа
  const allowedType = ALLOWED_IMAGE_TYPES[file.type as keyof typeof ALLOWED_IMAGE_TYPES];
  if (!allowedType) {
    return {
      valid: false,
      error: 'Допустимы только изображения (JPEG, PNG, GIF, WebP)',
    };
  }

  // 4. Проверка расширения
  if (!checkExtension(file.name, allowedType.extensions)) {
    return {
      valid: false,
      error: `Расширение файла не соответствует типу ${file.type}`,
    };
  }

  // 5. Проверка magic bytes (реального содержимого)
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    if (!checkMagicBytes(buffer, allowedType.magicBytes)) {
      return {
        valid: false,
        error: 'Содержимое файла не соответствует заявленному типу',
      };
    }
  } catch (error) {
    return {
      valid: false,
      error: 'Ошибка при проверке файла',
    };
  }

  return { valid: true };
}

/**
 * Валидация документа
 */
export async function validateDocumentFile(
  file: File,
  maxSizeBytes: number = 50 * 1024 * 1024 // 50MB по умолчанию
): Promise<FileValidationResult> {
  // 1. Проверка размера
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `Размер файла не должен превышать ${Math.round(maxSizeBytes / 1024 / 1024)} МБ`,
    };
  }

  // 2. Проверка на запрещенные расширения (КРИТИЧНО!)
  if (isBlockedExtension(file.name)) {
    return {
      valid: false,
      error: 'Загрузка исполняемых файлов запрещена',
    };
  }

  // 3. Проверка MIME-типа
  const allowedType = ALLOWED_DOCUMENT_TYPES[file.type as keyof typeof ALLOWED_DOCUMENT_TYPES];
  if (!allowedType) {
    return {
      valid: false,
      error: 'Допустимы только документы (PDF, DOC, DOCX, XLS, XLSX, TXT, CSV)',
    };
  }

  // 4. Проверка расширения
  if (!checkExtension(file.name, allowedType.extensions)) {
    return {
      valid: false,
      error: `Расширение файла не соответствует типу ${file.type}`,
    };
  }

  // 5. Проверка magic bytes (если определены)
  if (allowedType.magicBytes.length > 0) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      if (!checkMagicBytes(buffer, allowedType.magicBytes)) {
        return {
          valid: false,
          error: 'Содержимое файла не соответствует заявленному типу',
        };
      }
    } catch (error) {
      return {
        valid: false,
        error: 'Ошибка при проверке файла',
      };
    }
  }

  return { valid: true };
}

/**
 * Санитизация имени файла (удаление опасных символов и path traversal защита)
 */
export function sanitizeFileName(fileName: string): string {
  // Удаляем путь (path traversal защита)
  let baseName = fileName.replace(/^.*[\\/]/, '');
  
  // Удаляем null bytes
  baseName = baseName.replace(/\0/g, '');
  
  // Удаляем опасные символы и последовательности
  baseName = baseName
    .replace(/\.\./g, '') // Удаляем ../ атаки
    .replace(/[<>:"|?*\x00-\x1f]/g, '_') // Удаляем недопустимые символы Windows/Linux
    .replace(/^\.+/, '') // Удаляем точки в начале (скрытые файлы)
    .replace(/\s+/g, '_') // Заменяем пробелы на _
    .replace(/[^a-zA-Z0-9а-яА-ЯёЁ._-]/g, '_') // Заменяем остальные опасные символы
    .replace(/\.{2,}/g, '.') // Удаляем множественные точки
    .replace(/_+/g, '_') // Удаляем повторяющиеся подчеркивания
    .substring(0, 200); // Ограничиваем длину (оставляем запас для timestamp)
  
  // Проверка на пустое имя после очистки
  if (!baseName || baseName === '.' || baseName === '_') {
    baseName = 'file';
  }
  
  return baseName;
}

/**
 * Проверка SQL файлов на опасные команды (xp_cmdshell и т.д.)
 */
export async function scanSqlFileContent(file: File): Promise<FileValidationResult> {
  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith('.sql')) {
    return { valid: true };
  }
  
  try {
    const text = await file.text();
    
    // КРИТИЧНЫЕ команды SQL Server (удаление данных/системные операции)
    const criticalPatterns = [
      /xp_cmdshell/i,         // Выполнение OS команд
      /sp_configure/i,        // Изменение конфигурации сервера
      /sp_executesql/i,       // Динамический SQL (может быть инъекция)
      /openrowset/i,          // Удаленный доступ к данным
      /opendatasource/i,      // Удаленный доступ к источникам
    ];
    
    for (const pattern of criticalPatterns) {
      if (pattern.test(text)) {
        console.warn(`⚠️ SQL файл содержит потенциально опасную команду: ${file.name}`);
        return {
          valid: false,
          error: 'SQL файл содержит запрещенные системные команды (xp_cmdshell, sp_configure и др.)',
        };
      }
    }
    
    console.log(`✅ SQL файл прошел проверку: ${file.name}`);
    return { valid: true };
  } catch (error) {
    console.error('Ошибка при чтении SQL файла:', error);
    return { valid: true }; // Пропускаем если не можем прочитать
  }
}

/**
 * Проверка на потенциально опасный контент в текстовых файлах
 */
export async function scanTextFileContent(file: File): Promise<FileValidationResult> {
  if (!file.type.startsWith('text/') && file.type !== 'application/sql') {
    return { valid: true }; // Проверяем только текстовые файлы
  }
  
  try {
    const text = await file.text();
    
    // Опасные паттерны в текстовых файлах
    const dangerousPatterns = [
      /<script\b/i,           // JavaScript в HTML/XML
      /eval\s*\(/i,           // eval()
      /document\.write/i,     // document.write
      /window\.location/i,    // redirect
      /innerHTML\s*=/i,       // XSS
      /on(load|error|click)\s*=/i, // event handlers
      /exec\s*\(/i,           // command execution
      /system\s*\(/i,         // system calls
      /passthru\s*\(/i,       // PHP command execution
      /shell_exec/i,          // PHP shell execution
      /base64_decode/i,       // обфускация
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(text)) {
        console.warn(`⚠️ Подозрительный контент обнаружен в файле: ${file.name}`);
        return {
          valid: false,
          error: 'Файл содержит потенциально опасный код',
        };
      }
    }
    
    return { valid: true };
  } catch (error) {
    // Если не можем прочитать - пропускаем проверку
    return { valid: true };
  }
}

/**
 * Комплексная проверка файла (РЕКОМЕНДУЕТСЯ использовать везде!)
 */
export async function validateFileComprehensive(
  file: File,
  fileType: 'image' | 'document',
  maxSizeBytes?: number
): Promise<FileValidationResult> {
  // 1. Базовая валидация по типу
  const baseValidation = fileType === 'image' 
    ? await validateImageFile(file, maxSizeBytes)
    : await validateDocumentFile(file, maxSizeBytes);
  
  if (!baseValidation.valid) {
    return baseValidation;
  }
  
  // 2. Специализированная проверка SQL файлов
  const sqlValidation = await scanSqlFileContent(file);
  if (!sqlValidation.valid) {
    return sqlValidation;
  }
  
  // 3. Дополнительная проверка текстового контента
  const contentValidation = await scanTextFileContent(file);
  if (!contentValidation.valid) {
    return contentValidation;
  }
  
  // 4. Логирование для мониторинга
  console.log(`✅ Файл прошел валидацию: ${file.name} (${file.type}, ${file.size} bytes)`);
  
  return { valid: true };
}
