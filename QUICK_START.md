# 🚀 QUICK START GUIDE - KLAYK MARKETPLACE

## 📦 ВСТАНОВЛЕННЯ ТА ЗАПУСК

### 1️⃣ ПЕРЕВІРКА REQUIREMENTS
```bash
# Перевіримо Node.js версію (має бути >= 24)
node --version

# Перевіримо npm/bun версію
npm --version
# або
bun --version
```

### 2️⃣ ВСТАНОВЛЕННЯ ЗАЛЕЖНОСТЕЙ
```bash
# Перейдемо в папку проекту
cd apps/web

# Встановимо залежності (виберіть один варіант)
npm install
# або (більш швидко)
bun install
```

### 3️⃣ ЗАПУСК DEVELOPMENT СЕРВЕРА
```bash
# Запустимо сервер на localhost:3000
npm run dev
# або
bun dev
```

Сервер буде доступний на: **http://localhost:3000**

---

## 🔨 КОМАНДИ РОЗРОБКИ

### Development
```bash
npm run dev      # Запуск dev сервера на :3000
npm run build    # Production build
npm run start    # Запуск production сервера
```

### Лінтинг & Форматування
```bash
npm run lint     # Перевірка кода (Biome)
npm run format   # Автоматичне форматування кода
npm run check    # Повна перевірка (lint + format)
```

---

## 📁 СТРУКТУРА ПРОЕКТУ

```
apps/web/
├── src/
│   ├── app/
│   │   ├── layout.tsx       ← Root layout (SEO + providers)
│   │   ├── page.tsx         ← Home page
│   │   ├── providers.tsx    ← Context providers
│   │   └── globals.css      ← Tailwind v4 styles
│   ├── components/
│   │   ├── elements/
│   │   │   ├── Search/      ← SearchBar.tsx (адаптивний пошук)
│   │   │   ├── MobileMenu/  ← mobile-menu.tsx (боковий меню)
│   │   │   └── ...
│   │   ├── widgets/
│   │   │   └── Header/      ← Header.Desktop.tsx, Header.Mobile.tsx
│   │   └── ...
│   ├── hooks/               ← Custom React hooks
│   └── ...
├── public/                  ← Static файли
├── package.json             ← Dependencies
├── next.config.ts           ← Next.js конфіг
├── tsconfig.json            ← TypeScript конфіг
└── postcss.config.mjs       ← PostCSS конфіг
```

---

## 🎨 КЛЮЧОВІ ТЕХНОЛОГІЧНОСТІ

### Next.js 16.1.1
- App Router (файлова маршрутизація)
- Server/Client Components
- Image optimization
- Built-in API routes

### React 19.2.3
- Автоматичний JSX transform
- Server Components ready
- useCallback, useState, useRef hooks

### Tailwind CSS v4.1.18
- Новий синтаксис: `@import "tailwindcss"`
- Утиліти: `bg-linear-to-*`, `container`, `@layer`
- Responsive: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`

### Framer Motion 12.26.1
- `motion.div`, `motion.button` компоненти
- Анімації: `whileHover`, `whileTap`, `whileInView`
- `AnimatePresence` для mount/unmount
- Spring фізика: `transition={{ type: "spring" }}`

### TypeScript 5.9.3
- Strict mode: `true`
- Full type safety
- Path aliases: `@/*` → `./src/*`

---

## 🔥 ОСНОВНІ КОМПОНЕНТИ

### 1. HeaderDesktop (Desktop+Tablet)
```tsx
import { HeaderDesktop } from '@/components/widgets/Header/Header.Desktop';

<HeaderDesktop 
  cartCount={5}
  wishlistCount={2}
  compareCount={1}
/>
```

### 2. HeaderMobile (Mobile)
```tsx
import { HeaderMobile } from '@/components/widgets/Header/Header.Mobile';

<HeaderMobile cartCount={5} />
```

### 3. SearchBar (Адаптивний)
```tsx
import { SearchBar } from '@/components/elements/Search/SearchBar';

<SearchBar />
// На мобільних: іконка + модальне вікно
// На десктопі: повна форма пошуку
```

### 4. MobileMenu (Боковий меню)
```tsx
import { MobileMenu } from '@/components/elements/MobileMenu/mobile-menu';

<MobileMenu />
// Лівий бічний слайдаут
// Багаторівневе меню
// Smooth transitions
```

---

## 🎬 АНІМАЦІЇ

Всі компоненти мають **Framer Motion анімації**:

```tsx
// Hover effect (збільшення 10%)
whileHover={{ scale: 1.1 }}

// Tap effect (стиск 5%)
whileTap={{ scale: 0.95 }}

// Badge анімація
<motion.div
  initial={{ scale: 0.8, rotate: -10 }}
  animate={{ scale: 1, rotate: 0 }}
  transition={{ type: "spring", stiffness: 300 }}
>
  {count}
</motion.div>
```

---

## 🌍 МУЛЬТИЯЗИЧНІСТЬ

Проект підтримує **16 мов**:
- 🇺🇦 Українська (uk-UA)
- 🇬🇧 English (en-US)
- 🇵🇱 Polski (pl-PL)
- 🇩🇪 Deutsch (de-DE)
- 🇫🇷 Français (fr-FR)
- 🇮🇹 Italiano (it-IT)
- 🇪🇸 Español (es-ES)
- 🇵🇹 Português (pt-PT)
- 🇷🇴 Română (ro-RO)
- 🇨🇿 Čeština (cs-CZ)
- 🇸🇰 Slovenčina (sk-SK)
- 🇧🇬 Български (bg-BG)
- 🇭🇺 Magyar (hu-HU)
- 🇱🇹 Lietuvių (lt-LT)
- 🇱🇻 Latviešu (lv-LV)
- 🇪🇪 Eesti (et-EE)

---

## 🔒 ЗАЛЕЖНОСТІ БЕЗПЕКИ

```json
{
  "next-auth": "^4.24.13",    // Аутентифікація
  "tailwindcss": "^4.1.18",   // CSS styling
  "framer-motion": "^12.26.1" // Анімації
}
```

---

## 📈 PERFORMANCE TIPS

### Оптимізація:
- React Compiler включений (Babel plugin)
- Image optimization (next/image)
- Font optimization (swap strategy)
- CSS-in-JS мінімізовано (Tailwind only)

### Перевірка:
```bash
npm run build    # Перевірити production build
npm run lint     # Лінт код
```

---

## 🐛 DEBUGGING

### Chrome DevTools
1. Відкрийте DevTools (F12)
2. Перейдіть на вкладку **Network** для запитів
3. Перейдіть на **Console** для помилок
4. React DevTools розширення для компонентів

### Next.js Debug Mode
```bash
# Запустіть з debug логуванням
DEBUG=* npm run dev
```

---

## 🚨 РІШЕННЯ ПРОБЛЕМ

### Проблема: "Cannot find module"
```bash
# Видаліть node_modules і переінсталюйте
rm -rf node_modules bun.lock
npm install
```

### Проблема: Port 3000 вже займий
```bash
# Запустіть на іншому порту
npm run dev -- -p 3001
```

### Проблема: Tailwind CSS не стилізує
```bash
# Перевірите, що globals.css мається @import "tailwindcss"
# Перезапустіть dev сервер
```

---

## 📚 ДОКУМЕНТАЦІЯ

- [Next.js 16 Docs](https://nextjs.org/)
- [React 19 Docs](https://react.dev/)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [TypeScript Docs](https://www.typescriptlang.org/)

---

## ✅ ГОТОВНІСТЬ

```
✓ Node.js >= 24
✓ npm/bun встановлені
✓ node_modules існує
✓ Всі конфіги налаштовані
✓ TypeScript 0 помилок
✓ Tailwind CSS v4 готовий
✓ Framer Motion інтегрований
```

**Статус: READY TO DEVELOP** 🚀

---

**Questions?** Перевір MCP_NEXT_16_VERIFICATION.md для деталей
