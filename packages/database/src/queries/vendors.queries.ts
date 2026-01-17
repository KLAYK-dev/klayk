import { desc, eq } from "drizzle-orm";
import { db } from "../index.js";
import { vendors } from "../schema/vendors.schema.js";

export type CreateVendor = typeof vendors.$inferInsert;
export type UpdateVendor = Partial<CreateVendor>;

export async function getVendorById(vendorId: string) {
  return db.query.vendors.findFirst({
    where: eq(vendors.id, vendorId),
    with: {
      owner: {
        columns: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      warehouses: true,
      statistics: true, // Важливо для дашборду
    },
  });
}

export async function getVendorBySlug(slug: string) {
  return db.query.vendors.findFirst({
    where: eq(vendors.slug, slug),
    with: {
      statistics: true,
    },
  });
}

export async function getVendorByUserId(userId: string) {
  return db.query.vendors.findFirst({
    where: eq(vendors.userId, userId),
  });
}

export async function getAllVendors(page: number = 1, pageSize: number = 20) {
  return db.query.vendors.findMany({
    limit: pageSize,
    offset: (page - 1) * pageSize,
    orderBy: desc(vendors.createdAt),
    with: {
      owner: {
        columns: { email: true },
      },
    },
  });
}

export async function createVendor(data: CreateVendor) {
  const [newVendor] = await db.insert(vendors).values(data).returning();
  return newVendor;
}

export async function updateVendor(vendorId: string, data: UpdateVendor) {
  const [updatedVendor] = await db
    .update(vendors)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(vendors.id, vendorId))
    .returning();
  return updatedVendor;
}
