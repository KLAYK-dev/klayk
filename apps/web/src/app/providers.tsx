"use client";

import { TooltipProvider } from "@klayk/ui/components/ui/tooltip";
import { SessionProvider } from "next-auth/react";

interface ProvidersProps {
  children: React.ReactNode;
  locale?: string; // Додаємо опціональний проп locale
}

export function Providers({ children, locale }: ProvidersProps) {
  // Можна використовувати locale для налаштувань i18n, якщо потрібно
  // Наприклад, для налаштування формату дат, чисел тощо

  return (
    <SessionProvider>
      <TooltipProvider>{children}</TooltipProvider>
    </SessionProvider>
  );
}
