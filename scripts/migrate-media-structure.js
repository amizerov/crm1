const fs = require('fs').promises;
const path = require('path');

async function migrateMediaStructure() {
  console.log('🔄 Начинаем миграцию медиафайлов...');
  
  const oldDir = path.join(process.cwd(), 'public', 'projectdescription');
  const newBaseDir = path.join(process.cwd(), 'public', 'media');
  
  try {
    // Проверяем существует ли старая папка
    try {
      await fs.access(oldDir);
    } catch {
      console.log('❌ Папка projectdescription не найдена, миграция не нужна');
      return;
    }
    
    // Получаем список папок проектов
    const projectDirs = await fs.readdir(oldDir);
    
    for (const projectId of projectDirs) {
      const oldProjectDir = path.join(oldDir, projectId);
      const newProjectDir = path.join(newBaseDir, `p${projectId}`);
      
      // Проверяем что это папка
      const stat = await fs.stat(oldProjectDir);
      if (!stat.isDirectory()) continue;
      
      console.log(`📁 Обрабатываем проект ${projectId}...`);
      
      // Создаем новую папку
      await fs.mkdir(newProjectDir, { recursive: true });
      
      // Получаем список файлов в старой папке
      const files = await fs.readdir(oldProjectDir);
      
      for (const file of files) {
        const oldFilePath = path.join(oldProjectDir, file);
        const newFilePath = path.join(newProjectDir, file);
        
        // Проверяем что это файл изображения
        const ext = path.extname(file).toLowerCase();
        const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        
        if (!imageExts.includes(ext)) {
          console.log(`⚠️  Пропускаем не-изображение: ${file}`);
          continue;
        }
        
        try {
          // Копируем файл
          await fs.copyFile(oldFilePath, newFilePath);
          console.log(`✅ Скопирован: ${file}`);
        } catch (error) {
          console.error(`❌ Ошибка копирования ${file}:`, error.message);
        }
      }
    }
    
    console.log('✅ Миграция завершена!');
    console.log('');
    console.log('📋 Следующие шаги:');
    console.log('1. Проверьте что все изображения корректно отображаются');
    console.log('2. Если все работает, можете удалить старую папку:');
    console.log('   rm -rf public/projectdescription');
    console.log('');
    
  } catch (error) {
    console.error('❌ Ошибка миграции:', error);
  }
}

// Запускаем миграцию
migrateMediaStructure();