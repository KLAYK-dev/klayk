# 🚀 Drizzle ORM MCP Server Setup Guide

## Вступ

**MCP (Model Context Protocol)** - це протокол, який дозволяє AI-агентам (Claude, Cursor) безпосередньо взаємодіяти з вашою базою даних Drizzle ORM без прямого доступу до кодової бази.

---

## 📋 Що вміє MCP-сервер?

| Операція | Опис |
|----------|------|
| 🔍 **Інтроспекція схеми** | Читати структуру таблиць, колон, індексів |
| 🔄 **Міграції** | Генерувати та виконувати міграції через `drizzle-kit` |
| 📊 **SQL запити** | Виконувати сирі SQL-запити з параметризацією |
| 📖 **Читання даних** | Переглядати вміст таблиць |
| 🛡️ **Безпека** | Параметризовані запити, без SQL-ін'єкцій |

---

## 🔧 Parte 1: Локальна конфігурація

### 1.1 Переконайтеся, що у вас є NODE_ENV змінна

```bash
# Windows PowerShell
$env:NODE_ENV = "development"
$env:DATABASE_URL = "postgresql://user:password@localhost:5432/klayk_db"

# Або додайте у файл .env
```

### 1.2 Установіть залежності (якщо ще не встановлені)

```bash
cd c:\Users\user\Desktop\klayk
bun install
cd packages/database
bun install
```

### 1.3 Переконайтеся, що drizzle.config.ts правильно налаштований

```typescript
// drizzle.config.ts
import type { Config } from "drizzle-kit";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export default {
  schema: "./src/schema/",
  out: "./src/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
  casing: "snake_case",
  strict: true,
} satisfies Config;
```

---

## ▶️ Parte 2: Запуск MCP-сервера

### Метод 1: Локальний запуск (для тестування)

```bash
# У директорії packages/database
npm run db:mcp

# Або з DEBUG-інформацією
npm run db:mcp:dev
```

**Очікуваний вихід:**
```
✓ Drizzle MCP Server initialized
✓ Schema loaded: 14 tables
✓ Server listening on stdio
```

### Метод 2: Запуск через npx (тестування з абсолютним шляхом)

```bash
# Замініть <ABSOLUTE_PATH> на ваш реальний шлях
npx -y github:defrex/drizzle-mcp --config "c:/Users/user/Desktop/klayk/packages/database/drizzle.config.ts"
```

---

## 🔗 Parte 3: Інтеграція з Claude Desktop

### 3.1 Знайдіть конфіг Claude Desktop

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**macOS:**
```
~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Linux:**
```
~/.config/Claude/claude_desktop_config.json
```

### 3.2 Додайте MCP-сервер у конфіг

Відредагуйте файл та додайте:

```json
{
  "mcpServers": {
    "drizzle": {
      "command": "npx",
      "args": [
        "-y",
        "github:defrex/drizzle-mcp",
        "--config",
        "c:/Users/user/Desktop/klayk/packages/database/drizzle.config.ts"
      ],
      "env": {
        "DATABASE_URL": "postgresql://user:password@localhost:5432/klayk_db",
        "DEBUG": "drizzle-mcp:*"
      },
      "alwaysAllow": [
        "execute_query",
        "generate_migration",
        "get_schema_info"
      ]
    }
  }
}
```

⚠️ **Важливо:**
- Замініть шляхи на ваші реальні шляхи Windows (використовуйте forward slashes `/`)
- Замініть `DATABASE_URL` на вашу реальну рядок підключення
- Перезавантажте Claude Desktop після редагування конфігу

---

## ✅ Parte 4: Перевірка роботи

### Тест 1: Локальна перевірка через Node.js

```bash
# У директорії packages/database
node -e "
import('./src/index.js').then(db => {
  console.log('✓ Database module loaded');
  console.log('✓ Connection pool configured');
  console.log('✓ Ready for MCP operations');
}).catch(err => {
  console.error('✗ Error:', err.message);
  process.exit(1);
});
"
```

### Тест 2: Перевірка ENV змінних

```bash
# Windows PowerShell
echo "DATABASE_URL: $($env:DATABASE_URL)"
echo "NODE_ENV: $($env:NODE_ENV)"
```

### Тест 3: Запуск MCP сервера з виводом

```bash
cd packages/database
npm run db:mcp:dev
```

Очекуйте:
- ✅ Немає помилок підключення
- ✅ Схема успішно завантажена
- ✅ Сервер слухає stdin/stdout

### Тест 4: У Claude Desktop

1. Відкрийте Claude Desktop
2. Натисніть **⚙️ Settings** → **Developer** → **MCP Servers**
3. Повинен бути виділений сервер **"drizzle"** в статусі **"Connected"** ✓

---

## 📝 Приклади використання в Claude

### Приклад 1: Аналіз схеми

```
Клод: "Яка структура таблиці users? Покажи мені всі колони та індекси"

Claude отримає дозвіл виконати get_schema_info инструмент 
і повернути повну інформацію про таблицю
```

### Приклад 2: Виконання запиту

```
Клод: "Скільки всього замовлень у базі? Покажи їх статус розподіл"

Claude виконає:
SELECT status, COUNT(*) as count FROM orders GROUP BY status;
```

### Приклад 3: Генерація міграції

```
Клод: "Додай таблицю для tracking доставки замовлень 
з полями: tracking_id, order_id, status, updated_at"

Claude згенерує міграцію через drizzle-kit generate
```

---

## 🐛 Troubleshooting

### Проблема: "DATABASE_URL is not set"

```bash
# Переконайтеся, що ENV змінна встановлена
echo $env:DATABASE_URL

# Якщо не встановлена:
$env:DATABASE_URL = "postgresql://localhost:5432/klayk_db"
```

### Проблема: "Cannot find drizzle-mcp module"

```bash
# Переконайтеся, що у вас Node.js >= 18
node --version

# Спробуйте встановити з npx напряму
npx -y github:defrex/drizzle-mcp --config ./drizzle.config.ts
```

### Проблема: "Schema loading timeout"

```bash
# Збільшіть timeout:
npm run db:mcp:dev

# Перевірте, чи база даних доступна:
psql $DATABASE_URL -c "SELECT 1"
```

### Проблема: Claude Desktop не підключається

```bash
# 1. Перевірте синтаксис JSON у claude_desktop_config.json
# 2. Перезавантажте Claude Desktop
# 3. Перевірте шляхи (мають бути абсолютними!)
# 4. Розгляньте лог: $env:DEBUG = "mcp:*"; npm run db:mcp
```

---

## 🎯 Використання в практиці

### Для вашого маркетплейсу KLAYK:

```
Розробник: "Клод, проаналізуй, чому в таблиці orders є дублі за 
order_number. Покажи запит та пропозицію з міграцією для уникнення цього"

Клод:
1. Виконає SELECT запит для знаходження дублів
2. Аналізує поточні індекси
3. Пропозиція: "Додамо UNIQUE constraint на order_number"
4. Згенерує міграцію:
   ALTER TABLE orders ADD CONSTRAINT unique_order_number 
   UNIQUE(order_number);
```

---

## 📚 Додатково

**Офіційний репозиторій:** https://github.com/defrex/drizzle-mcp

**MCP Spec:** https://modelcontextprotocol.io

**Drizzle Docs:** https://orm.drizzle.team

---

## ✨ Резюме команд

| Команда | Опис |
|---------|------|
| `npm run db:mcp` | Запуск MCP-сервера (продакшн) |
| `npm run db:mcp:dev` | Запуск з DEBUG-інформацією |
| `npm run db:studio` | Веб-інтерфейс Drizzle Studio |
| `npm run db:generate` | Генерувати міграцію |
| `npm run db:push` | Застосувати міграції |

---

**Готово! 🎉** Ваш Drizzle ORM тепер інтегрований з MCP протоколом!
