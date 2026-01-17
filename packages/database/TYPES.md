# Типи даних Drizzle ORM

## Користувачі (Users)

```typescript
type User = {
  id: string;                    // UUID
  email: string;                 // Unique
  name?: string;
  password?: string;             // Хешований пароль
  avatar?: string;               // URL
  bio?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  role: "user" | "seller" | "admin";
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  
  // Relations
  products?: Product[];
  orders?: Order[];
  reviews?: Review[];
};
```

## Товари (Products)

```typescript
type Product = {
  id: string;                    // UUID
  name: string;
  slug: string;                  // URL-friendly, unique
  description?: string;
  categoryId: string;            // FK to categories
  sellerId: string;              // FK to users
  price: string;                 // Decimal as string for precision
  originalPrice?: string;
  stock: string;                 // Quantity in stock
  rating: string;                // 0-5 stars
  reviewCount: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  category?: Category;
  seller?: User;
  reviews?: Review[];
  orders?: OrderItem[];
};
```

## Категорії (Categories)

```typescript
type Category = {
  id: string;                    // UUID
  name: string;                  // Unique
  slug: string;                  // URL-friendly, unique
  description?: string;
  image?: string;                // URL
  parentId?: string;             // For subcategories
  isActive: boolean;
  displayOrder: string;
  createdAt: Date;
  
  // Relations
  products?: Product[];
};
```

## Замовлення (Orders)

```typescript
type Order = {
  id: string;                    // UUID
  userId: string;                // FK to users
  orderNumber: string;           // ORD-123456789, unique
  totalAmount: string;           // Decimal as string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  shippingAddress: string;       // Full address
  trackingNumber?: string;       // For shipping
  notes?: string;
  estimatedDeliveryDate?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  user?: User;
  items?: OrderItem[];
};
```

## Товари в замовленнях (OrderItems)

```typescript
type OrderItem = {
  id: string;                    // UUID
  orderId: string;               // FK to orders
  productId: string;             // FK to products
  quantity: string;              // Number as string
  priceAtPurchase: string;       // Decimal as string (snapshot)
  subtotal: string;              // quantity * price
  
  // Relations
  order?: Order;
  product?: Product;
};
```

## Відгуки (Reviews)

```typescript
type Review = {
  id: string;                    // UUID
  productId: string;             // FK to products
  userId: string;                // FK to users
  rating: string;                // "1" to "5"
  title?: string;
  comment?: string;
  isVerified: boolean;           // Did user buy it?
  isApproved: boolean;           // For moderation
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  product?: Product;
  user?: User;
};
```

## Типи для Input операцій

### Створення користувача

```typescript
type CreateUserInput = {
  email: string;
  name?: string;
  password?: string;
  role?: "user" | "seller" | "admin";
};
```

### Оновлення користувача

```typescript
type UpdateUserInput = Partial<{
  name: string;
  avatar: string;
  bio: string;
  isActive: boolean;
  lastLoginAt: Date;
}>;
```

### Створення товара

```typescript
type CreateProductInput = {
  name: string;
  slug: string;
  description?: string;
  categoryId: string;
  sellerId: string;
  price: string;
  originalPrice?: string;
  stock?: string;
  isFeatured?: boolean;
};
```

### Оновлення товара

```typescript
type UpdateProductInput = Partial<{
  name: string;
  description: string;
  price: string;
  stock: string;
  rating: string;
  reviewCount: string;
  isActive: boolean;
  isFeatured: boolean;
}>;
```

### Створення замовлення

```typescript
type CreateOrderInput = {
  userId: string;
  orderNumber: string;
  totalAmount: string;
  shippingAddress: string;
  notes?: string;
};
```

### Оновлення статусу замовлення

```typescript
type UpdateOrderStatusInput = {
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus?: "pending" | "paid" | "failed" | "refunded";
  trackingNumber?: string;
  estimatedDeliveryDate?: Date;
  deliveredAt?: Date;
};
```

## Enums

```typescript
enum UserRole {
  User = "user",
  Seller = "seller",
  Admin = "admin",
}

enum OrderStatus {
  Pending = "pending",
  Processing = "processing",
  Shipped = "shipped",
  Delivered = "delivered",
  Cancelled = "cancelled",
}

enum PaymentStatus {
  Pending = "pending",
  Paid = "paid",
  Failed = "failed",
  Refunded = "refunded",
}

enum ReviewRating {
  OneStar = "1",
  TwoStars = "2",
  ThreeStars = "3",
  FourStars = "4",
  FiveStars = "5",
}
```

## Примітки щодо типів даних

### Чому значення типу string?

Деякі поля (ціна, кількість) зберігаються як `string` замість `number`:

- **Точність**: Decimal числа (99.99) можуть мати проблеми з точністю в JavaScript
- **BigInt**: PostgreSQL числа можуть бути дуже великими
- **Безпека**: Рядки не піддаються окисленню при передачі JSON

Při роботі зі значеннями:

```typescript
// Правильно
const price = "99.99";
const total = (Number(price) * quantity).toFixed(2);

// Неправильно - може привести до помилок
const price = 99.99;
const total = price * quantity;  // Може дати 299.9700000000001
```

### UUID замість Integer ID

Використовуємо UUID:

- **Безпека**: Складно угадати ID
- **Розподіленість**: Можна генерувати ID без координації з БД
- **Приватність**: ID не розкривають кількість записів

### Timestamps з timezone

Всі `timestamp` включають timezone для правильної роботи з різними часовими поясами:

```typescript
// Правильно
timestamp("created_at", { withTimezone: true })

// Неправильно
timestamp("created_at")
```

## Relations Query

При отриманні даних з relations:

```typescript
// Повні дані з relations
const product = await db.query.products.findFirst({
  with: {
    category: true,
    seller: true,
    reviews: {
      with: {
        user: true,
      },
      limit: 5,
    },
  },
});

// Вибір певних полів
const product = await db.query.products.findFirst({
  with: {
    seller: {
      columns: {
        id: true,
        name: true,
        avatar: true,
      },
    },
  },
});
```
