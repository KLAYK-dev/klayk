import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { featureFlags, systemSettings } from "../schema/settings.schema.js";

// Отримати налаштування за ключем
export async function getSystemSetting(key: string) {
  const result = await db.query.systemSettings.findFirst({
    // Виправлено: systemSettings.settingKey замість .key
    where: eq(systemSettings.settingKey, key),
  });

  // Виправлено: result.settingValue замість .value
  return result?.settingValue; // Повертає JSON значення
}

// Оновити налаштування
// Використовуємо unknown замість any для безпеки типів, якщо це JSON
export async function updateSystemSetting(key: string, value: unknown, userId: string) {
  return (
    db
      .update(systemSettings)
      .set({
        // Виправлено: settingValue замість value
        settingValue: value,
        updatedBy: userId,
        updatedAt: new Date(),
      })
      // Виправлено: settingKey замість key
      .where(eq(systemSettings.settingKey, key))
      .returning()
  );
}

// Перевірити Feature Flag
export async function isFeatureEnabled(key: string) {
  const flag = await db.query.featureFlags.findFirst({
    // Виправлено: featureFlags.flagKey замість .key
    // Примітка: перевірте у settings.schema.ts, як точно називається поле.
    // Зазвичай це flagKey або name. Якщо помилка залишиться, змініть на .name
    where: eq(featureFlags.flagKey, key),
  });
  return flag?.isEnabled ?? false;
}
