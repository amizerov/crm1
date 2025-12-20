# Настройка SESSION_SECRET для iron-session

## КРИТИЧНО: Добавьте SESSION_SECRET в .env.local

Создайте файл `.env.local` в корне проекта и добавьте:

```env
SESSION_SECRET=qtSD1xeYkWMKGUIeGV2aru3iVs5CH7qE2qlmd+zou/s=
```

## Для production сервера

На production сервере создайте `.env.production.local`:

```bash
# На сервере
cd ~/projects/NextJS/crm1
nano .env.production.local
```

Добавьте:
```env
SESSION_SECRET=qtSD1xeYkWMKGUIeGV2aru3iVs5CH7qE2qlmd+zou/s=
NODE_ENV=production
```

## Генерация нового секрета (если нужно)

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Безопасность

⚠️ **НИКОГДА не коммитьте .env.local в git!**
⚠️ Минимальная длина: 32 байта (автоматически сгенерировано)
✅ Используйте разные секреты для dev и production
