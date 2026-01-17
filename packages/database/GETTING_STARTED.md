# @klayk/database - Швидкий Старт

## � PostgreSQL Connection з postgres.js

Пакет використовує **postgres.js** драйвер для оптимальної роботи з PostgreSQL:

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Connection pool налаштування в src/index.ts
const queryClient = postgres(process.env.DATABASE_URL, {
  prepare: false,        // disable prepare statements
  max: 10,              // max connection pool size
  timeout: 30,          // connection timeout
  idle_timeout: 30,     // idle timeout
  max_lifetime: 3600,   // max connection lifetime
  backoff: "exponential", // exponential backoff on error
  ssl: isProd ? "require" : undefined,
});

const db = drizzle({ client: queryClient });
```

## �🚀 Встановлення

### 1. Додати в свій додаток

```typescript
// tsconfig.json paths
{
  "compilerOptions": {
    "paths": {
      "@klayk/database": ["../../packages/database/src"],
      "@klayk/database/*": ["../../packages/database/src/*"]
    }
  }
}
```

### 2. Імпортувати в коді

```typescript
// В API маршруті або Server Component
import { db, getUserById, getProductById } from "@klayk/database";

export async function GET() {
  const user = await getUserById("user-id");
  return Response.json(user);
}
```

### 3. Налаштувати ENV

Додати в `.env.local`:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/klayk_marketplace"
```

## 📝 Типові операції

### Отримати користувача

```typescript
import { getUserById, getUserByEmail } from "@klayk/database";

// По ID
const user = await getUserById("550e8400-e29b-41d4-a716-446655440000");

// По email
const user = await getUserByEmail("test@example.com");
```

### Отримати товар з відгуками

```typescript
import { getProductById } from "@klayk/database";

const product = await getProductById("product-id");
console.log(product.category);  // Категорія
console.log(product.seller);    // Продавець
console.log(product.reviews);   // Останні 5 відгуків
```

### Отримати замовлення користувача

```typescript
import { getOrdersByUserId } from "@klayk/database";

const orders = await getOrdersByUserId("user-id", 10, 0);
// orders[0].user    - інформація про користувача
// orders[0].items[] - товари в замовленні
```

### Створити новий товар

```typescript
import { createProduct } from "@klayk/database";

const product = await createProduct({
  name: "Product Name",
  slug: "product-name",
  description: "Description",
  categoryId: "category-id",
  sellerId: "seller-id",
  price: "99.99",
  stock: "100",
});
```

### Пошук товарів

```typescript
import { db, products } from "@klayk/database";
import { ilike, desc } from "drizzle-orm";

// Full-text search
const results = await db.query.products.findMany({
  where: ilike(products.name, "%laptop%"),
  limit: 20,
  orderBy: desc(products.createdAt),
});
```

### Огляд замовлення з усіма деталями

```typescript
import { getOrderById } from "@klayk/database";

const order = await getOrderById("order-id");

console.log({
  orderNumber: order.orderNumber,
  totalAmount: order.totalAmount,
  status: order.status,
  user: order.user,           // Замовник
  items: order.items.map(item => ({  // Товари в замовленні
    name: item.product.name,
    quantity: item.quantity,
    price: item.priceAtPurchase,
  })),
});
```

## 🔄 Transactions

```typescript
import { db, users, orders } from "@klayk/database";
import { eq } from "drizzle-orm";

const result = await db.transaction(async (tx) => {
  // Зменшити stock товара
  await tx
    .update(products)
    .set({ stock: `${Number(product.stock) - quantity}` })
    .where(eq(products.id, productId));

  // Створити замовлення
  const [order] = await tx
    .insert(orders)
    .values({
      userId: userId,
      totalAmount: totalAmount,
      status: "pending",
      orderNumber: `ORD-${Date.now()}`,
      shippingAddress: address,
    })
    .returning();

  return order;
});
```

## 📊 Aggregations

```typescript
import { db, products } from "@klayk/database";
import { count, avg, sum } from "drizzle-orm";

// Кількість товарів в категорії
const stats = await db
  .select({
    count: count(),
    avgPrice: avg(products.price),
    avgRating: avg(products.rating),
  })
  .from(products)
  .where(eq(products.categoryId, categoryId));
```

## 🔐 Relations

```typescript
import { db, products } from "@klayk/database";

// Отримати товар з усіма relations
const product = await db.query.products.findFirst({
  with: {
    category: true,           // Категорія товара
    seller: true,             // Дані продавця
    reviews: {                // Відгуки
      with: {
        user: {               // Автор відгуку
          columns: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      limit: 10,
    },
  },
});
```

## 🐛 Debug

Увімкнути логування SQL запитів:

```bash
DEBUG=true npm run dev
```

Или в коді:

```typescript
import { db } from "@klayk/database";

// db логує всі запити в dev режимі
```

## 💾 Перший запуск

```bash
# 1. Встановити залежності
npm install

# 2. Налаштувати .env
# DATABASE_URL="postgresql://..."

# 3. Генерувати migrations
npm run db:generate

# 4. Запустити migrations
npm run db:push

# 5. (Опціонально) Seed demo даних
npm run db:seed
```

## 📚 Докладніше

Дивись [README.md](./README.md) для повної документації.
