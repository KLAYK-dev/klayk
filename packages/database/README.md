# @klayk/database

Drizzle ORM database layer для KLAYK Marketplace. Використовує **postgres.js** драйвер для оптимальної продуктивності та масштабованості.

## 🔧 Технічний Stack

- **ORM**: Drizzle ORM v0.45.1
- **Driver**: postgres.js 3.4.8 (PostgreSQL драйвер)
- **Database**: PostgreSQL 12+
- **Connection Pooling**: Built-in у postgres.js
- **Migrations**: Drizzle Kit 0.31.8
- **Node.js**: >=24

### Чому postgres.js?

✅ **Найшвидший** PostgreSQL драйвер для Node.js  
✅ **Встроєний connection pool** - не потребує PgBouncer  
✅ **Exponential backoff reconnection** - автоматичне відновлення  
✅ **SSL/TLS підтримка** - безпеча для production  
✅ **Підготовані оператори** - захист від SQL-injection  

## 📦 Структура

```
src/
├── index.ts              # Drizzle DB інстанс з postgres.js
├── schema/               # Таблиці та relations
│   ├── users.ts         # Користувачі
│   ├── products.ts      # Товари
│   ├── orders.ts        # Замовлення
│   ├── categories.ts    # Категорії
│   └── index.ts         # Експорти всіх схем
├── queries/              # Pre-made queries
│   ├── users.ts
│   ├── products.ts
│   ├── orders.ts
│   └── index.ts
└── migrations/           # Generated migrations
    └── index.ts         # Migration helper functions
```

## 🚀 Встановлення

### 1. Встановити залежності

```bash
npm install @klayk/database
```

### 2. Налаштувати environment

```bash
# Скопіювати .env.example в .env
cp .env.example .env

# Обновити DATABASE_URL
DATABASE_URL="postgresql://user:password@localhost:5432/klayk_marketplace"
```

### 3. Генерувати migrations

```bash
npm run db:generate
```

### 4. Запустити migrations

```bash
npm run db:push
```

## 📚 Використання

### Базові query операції

```typescript
import { db, getUserById, getProductById } from "@klayk/database";

// Отримати користувача
const user = await getUserById("user-id");

// Отримати товар з relations
const product = await getProductById("product-id");

// Отримати товари за категорією
const products = await getProductsByCategory("category-id");
```

### Custom queries з Drizzle

```typescript
import { db, users, products } from "@klayk/database";
import { eq } from "drizzle-orm";

// Select
const user = await db.query.users.findFirst({
  where: eq(users.email, "user@example.com"),
});

// Insert
const [newUser] = await db
  .insert(users)
  .values({
    email: "new@example.com",
    name: "New User",
  })
  .returning();

// Update
const [updated] = await db
  .update(users)
  .set({ name: "Updated Name" })
  .where(eq(users.id, "user-id"))
  .returning();

// Delete
await db.delete(users).where(eq(users.id, "user-id"));
```

### Transactions

```typescript
import { db } from "@klayk/database";

const result = await db.transaction(async (tx) => {
  // Все операції в одній транзакції
  const user = await tx.query.users.findFirst({
    where: eq(users.email, "test@example.com"),
  });

  // Якщо щось піде не так - все відкатається
  const order = await tx.insert(orders).values({
    userId: user.id,
    // ...
  });

  return { user, order };
});
```

## 🔧 Доступні команди

```bash
# Generate migrations
npm run db:generate

# Push migrations to database
npm run db:push

# Pull schema from existing database
npm run db:pull

# Open Drizzle Studio (GUI для управління БД)
npm run db:studio

# Type checking
npm run check-types

# Linting
npm run lint

# Format code
npm run format
```

## 📊 Таблиці БД

### Users
- `id` (uuid, primary key)
- `email` (unique)
- `name`
- `password` (hashed)
- `avatar` (URL)
- `bio`
- `isEmailVerified`
- `isActive`
- `role` (user | seller | admin)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)
- `lastLoginAt` (timestamp)

**Relations:**
- `products` - товари продавця
- `orders` - замовлення користувача
- `reviews` - відгуки користувача

### Categories
- `id` (uuid, primary key)
- `name` (unique)
- `slug` (unique)
- `description`
- `image` (URL)
- `parentId` (для підкатегорій)
- `isActive`
- `displayOrder`
- `createdAt` (timestamp)

**Relations:**
- `products` - товари в категорії

### Products
- `id` (uuid, primary key)
- `name`
- `slug` (unique)
- `description`
- `categoryId` (foreign key)
- `sellerId` (foreign key)
- `price` (string for precision)
- `originalPrice`
- `stock`
- `rating` (0-5)
- `reviewCount`
- `isActive`
- `isFeatured`
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

**Relations:**
- `category` - категорія товара
- `seller` - продавець
- `reviews` - відгуки
- `orders` - замовлення товара

### Orders
- `id` (uuid, primary key)
- `userId` (foreign key)
- `orderNumber` (unique)
- `totalAmount` (string for precision)
- `status` (pending | processing | shipped | delivered | cancelled)
- `paymentStatus` (pending | paid | failed | refunded)
- `shippingAddress`
- `trackingNumber`
- `notes`
- `estimatedDeliveryDate` (timestamp)
- `deliveredAt` (timestamp)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

**Relations:**
- `user` - замовник
- `items` - товари в замовленні

### OrderItems
- `id` (uuid, primary key)
- `orderId` (foreign key)
- `productId` (foreign key)
- `quantity`
- `priceAtPurchase` (string for precision)
- `subtotal` (string for precision)

**Relations:**
- `order` - замовлення
- `product` - товар

### Reviews
- `id` (uuid, primary key)
- `productId` (foreign key)
- `userId` (foreign key)
- `rating` (1-5)
- `title`
- `comment`
- `isVerified` (чи покупав користувач)
- `isApproved` (для модерації)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

**Relations:**
- `product` - товар
- `user` - автор відгуку

## 🔐 Environment Variables

```env
# PostgreSQL connection string
DATABASE_URL=postgresql://user:password@host:port/database

# Node environment
NODE_ENV=development|production

# Debug logging
DEBUG=true|false
```

## 🛠️ Development

### Додати нову таблицю

1. Створити нову схему в `src/schema/`
2. Добавити relations
3. Запустити `npm run db:generate`
4. Переглянути wygenerowanы migration в `src/migrations/`
5. Запустити `npm run db:push`

### Додати нові queries

Додати функції в `src/queries/index.ts`:

```typescript
export async function getMyCustomData() {
  return db.query.users.findMany({
    // custom logic
  });
}
```

## 📝 Best Practices

1. **Завжди використовуйте transactions** для критичних операцій
2. **Type-safe queries** - використовуйте Drizzle типи для validation
3. **Кешування** - додайте Redis для часто запитуваних даних
4. **Индекси** - оптимізуйте для часто використовуваних полів
5. **Migration naming** - використовуйте описові імена для міграцій

## 🐛 Troubleshooting

### "DATABASE_URL is not set"
```bash
# Переконайтесь, що .env файл існує і містить DATABASE_URL
cat .env
```

### "Cannot find migrations"
```bash
# Переконайтесь, що migrations були згенеровані
npm run db:generate
```

### "Connection refused"
```bash
# Переконайтесь, що PostgreSQL сервер запущений
psql -U user -h localhost -p 5432
```

## 📖 Документація

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

## 📄 Ліцензія

MIT
