import { desc, eq } from "drizzle-orm";
import { db } from "../index.js";
import { users } from "../schema/users.schema.js";

// Типи для вставки та оновлення (автоматично з Drizzle)
export type CreateUser = typeof users.$inferInsert;
export type UpdateUser = Partial<CreateUser>;

export async function getUserById(userId: string) {
  return db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      addresses: true, // Відразу підтягуємо адреси
    },
  });
}

export async function getUserByEmail(email: string) {
  return db.query.users.findFirst({
    where: eq(users.email, email),
  });
}

export async function getAllUsers(page: number = 1, pageSize: number = 50) {
  return db.query.users.findMany({
    limit: pageSize,
    offset: (page - 1) * pageSize,
    orderBy: desc(users.createdAt),
  });
}

export async function createUser(data: CreateUser) {
  const [newUser] = await db.insert(users).values(data).returning();
  return newUser;
}

export async function updateUser(userId: string, data: UpdateUser) {
  const [updatedUser] = await db
    .update(users)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();
  return updatedUser;
}

export async function deleteUser(userId: string) {
  // Soft delete (рекомендовано)
  return db.update(users).set({ deletedAt: new Date() }).where(eq(users.id, userId));
}
