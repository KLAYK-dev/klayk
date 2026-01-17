"use client";

import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { defaultLanguage, languages } from "@/constants/LanguageElement/LanguageConst";

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = pathname.split("/")[1] || defaultLanguage;

  const handleChangeLanguage = (lang: string) => {
    const segments = pathname.split("/");
    segments[1] = lang;
    const newPath = segments.join("/") || "/";
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative hidden md:flex items-center select-none">
      {/* Поточна мова */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center text-lg font-semibold tracking-wide
                   text-white/90 hover:text-green-300 px-3 py-1.5 rounded-md
                   border border-transparent hover:border-green-300 transition-colors"
        aria-label="Змінити мову"
        title="Змінити мову"
      >
        {currentLang.toUpperCase()}
      </button>

      {/* Список мов */}
      {isOpen && (
        <>
          {/* ✅ ВИПРАВЛЕНО: Замість div використовуємо button.
             - type="button": щоб це була кнопка.
             - tabIndex={-1}: щоб клавіша Tab ігнорувала цей фон (фокус має бути на списку).
             - cursor-default: щоб курсор не змінювався на "руку" по всьому екрану.
             - w-full h-full: явно розтягуємо на весь екран.
          */}
          <button
            type="button"
            className="fixed inset-0 z-40 w-full h-full cursor-default bg-transparent"
            onClick={() => setIsOpen(false)}
            tabIndex={-1}
            aria-label="Закрити меню мов"
          />

          <div
            className="absolute right-0 top-full mt-3 bg-white text-black text-base rounded-lg shadow-lg z-50 
                       min-w-55 max-h-80 overflow-auto border border-gray-200"
          >
            <div className="flex flex-col divide-y divide-gray-100">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleChangeLanguage(lang.code)}
                  className={clsx(
                    "px-4 py-2 text-left hover:bg-gray-100 hover:text-green-600 transition-colors",
                    lang.code === currentLang && "bg-gray-200 font-semibold",
                  )}
                >
                  <span className="text-lg mr-2">{lang.code.toUpperCase()}</span>
                  <span className="text-sm text-gray-600">{lang.nativeLabel}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
