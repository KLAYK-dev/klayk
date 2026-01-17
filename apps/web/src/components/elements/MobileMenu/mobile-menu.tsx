"use client";

import { Badge } from "@klayk/ui/components/ui/badge";
import { ScrollArea } from "@klayk/ui/components/ui/scroll-area";
import { Separator } from "@klayk/ui/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@klayk/ui/components/ui/sheet";
import {
  Bell,
  Flame,
  Headphones,
  Heart,
  LogOut,
  Menu,
  Package,
  Scale,
  Settings,
  Shield,
  ShoppingCart,
  Smartphone,
  Store,
  Timer,
  TrendingUp,
  User,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

// Типи для TypeScript
interface MenuItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  isNew?: boolean;
}

interface InfoItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
  isExternal?: boolean;
}

// Основні пункти меню з покращеними іконками та бейджами
const mainMenuItems: MenuItem[] = [
  {
    href: "/deals",
    label: "Акції та знижки",
    icon: <Flame className="h-5 w-5 text-red-500" />,
    badge: 12,
    isNew: true,
  },
  {
    href: "/express-delivery",
    label: "Експрес доставка",
    icon: <Timer className="h-5 w-5 text-emerald-500" />,
  },
  {
    href: "/profile",
    label: "Мій профіль",
    icon: <User className="h-5 w-5 text-blue-500" />,
  },
  {
    href: "/wishlist",
    label: "Список бажань",
    icon: <Heart className="h-5 w-5 text-pink-500" />,
    badge: 3,
  },
  {
    href: "/compare",
    label: "Порівняння товарів",
    icon: <Scale className="h-5 w-5 text-purple-500" />,
    badge: 2,
  },
  {
    href: "/cart",
    label: "Кошик",
    icon: <ShoppingCart className="h-5 w-5 text-orange-500" />,
    badge: 5,
  },
];

// Пункти каталогу
const catalogItems: MenuItem[] = [
  {
    href: "/vendors",
    label: "Продавці",
    icon: <Store className="h-5 w-5 text-indigo-500" />,
  },
  {
    href: "/brands",
    label: "Бренди",
    icon: <TrendingUp className="h-5 w-5 text-cyan-500" />,
  },
  {
    href: "/new-arrivals",
    label: "Новинки",
    icon: <Package className="h-5 w-5 text-green-500" />,
    isNew: true,
  },
];

// Інформаційні пункти
const infoItems: InfoItem[] = [
  {
    href: "/help",
    label: "Центр допомоги",
    icon: <Headphones className="h-4 w-4 text-gray-600" />,
  },
  {
    href: "/become-seller",
    label: "Стати продавцем",
    icon: <Store className="h-4 w-4 text-gray-600" />,
  },
  {
    href: "/mobile-app",
    label: "Мобільний додаток",
    icon: <Smartphone className="h-4 w-4 text-gray-600" />,
  },
  {
    href: "/warranty",
    label: "Гарантія якості",
    icon: <Shield className="h-4 w-4 text-gray-600" />,
  },
];

// Налаштування користувача
const userSettings: InfoItem[] = [
  {
    href: "/notifications",
    label: "Сповіщення",
    icon: <Bell className="h-4 w-4 text-gray-600" />,
  },
  {
    href: "/settings",
    label: "Налаштування",
    icon: <Settings className="h-4 w-4 text-gray-600" />,
  },
  {
    href: "/logout",
    label: "Вийти",
    icon: <LogOut className="h-4 w-4 text-red-500" />,
  },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  // Оптимізована функція закриття меню
  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  // Компонент для відображення пункту меню
  const MenuItemComponent = ({ item, onClick }: { item: MenuItem; onClick?: () => void }) => (
    <Link
      href={item.href}
      onClick={onClick}
      className="group flex items-center justify-between p-3 rounded-xl 
               hover:bg-linear-to-r hover:from-blue-50 hover:to-indigo-50 
               transition-all duration-200 ease-in-out
               active:scale-95 active:bg-blue-100"
    >
      <div className="flex items-center gap-3">
        <div
          className="p-2 rounded-lg bg-gray-50 group-hover:bg-white 
                      group-hover:shadow-sm transition-all duration-200"
        >
          {item.icon}
        </div>
        <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
          {item.label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {item.isNew && (
          <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs px-2 py-1">
            Нове
          </Badge>
        )}
        {item.badge && item.badge > 0 && (
          <Badge
            className="bg-red-500 text-white text-xs min-w-5 h-5 
                         flex items-center justify-center rounded-full"
          >
            {item.badge > 99 ? "99+" : item.badge}
          </Badge>
        )}
      </div>
    </Link>
  );

  // Компонент для інформаційних пунктів
  const InfoItemComponent = ({ item, onClick }: { item: InfoItem; onClick?: () => void }) => (
    <Link
      href={item.href}
      onClick={onClick}
      className="flex items-center gap-3 p-2 rounded-lg 
               hover:bg-gray-50 transition-colors duration-150
               active:bg-gray-100"
    >
      {item.icon}
      <span className="text-sm text-gray-700 hover:text-gray-900">{item.label}</span>
    </Link>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 flex items-center justify-center shrink-0"
          aria-label="Відкрити меню"
          title="Меню"
        >
          <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-87.5 sm:w-100 bg-white border-r border-gray-200 
                   shadow-2xl backdrop-blur-sm"
      >
        <SheetHeader className="border-b border-gray-100 pb-4">
          <SheetTitle className="text-xl font-bold text-gray-900">Меню</SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-5rem)] pr-4">
          <div className="space-y-6 py-6">
            {/* Головне меню */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-linear-to-b from-blue-500 to-purple-500 rounded-full"></div>
                <h4 className="font-semibold text-gray-900">Головне меню</h4>
              </div>
              <div className="space-y-1">
                {mainMenuItems.map((item) => (
                  <MenuItemComponent key={item.href} item={item} onClick={handleClose} />
                ))}
              </div>
            </div>

            <Separator className="bg-linear-to-r from-transparent via-gray-200 to-transparent" />

            {/* Каталог */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-linear-to-b from-green-500 to-emerald-500 rounded-full"></div>
                <h4 className="font-semibold text-gray-900">Каталог</h4>
              </div>
              <div className="space-y-1">
                {catalogItems.map((item) => (
                  <MenuItemComponent key={item.href} item={item} onClick={handleClose} />
                ))}
              </div>
            </div>

            <Separator className="bg-linear-to-r from-transparent via-gray-200 to-transparent" />

            {/* Інформація та підтримка */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-linear-to-b from-orange-500 to-red-500 rounded-full"></div>
                <h4 className="font-semibold text-gray-900">Інформація</h4>
              </div>
              <div className="space-y-1">
                {infoItems.map((item) => (
                  <InfoItemComponent key={item.href} item={item} onClick={handleClose} />
                ))}
              </div>
            </div>

            <Separator className="bg-linear-to-r from-transparent via-gray-200 to-transparent" />

            {/* Налаштування користувача */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-linear-to-b from-purple-500 to-pink-500 rounded-full"></div>
                <h4 className="font-semibold text-gray-900">Налаштування</h4>
              </div>
              <div className="space-y-1">
                {userSettings.map((item) => (
                  <InfoItemComponent key={item.href} item={item} onClick={handleClose} />
                ))}
              </div>
            </div>

            {/* Додаткова інформація внизу */}
            <div
              className="mt-8 p-4 bg-linear-to-r from-blue-50 to-indigo-50 
                            rounded-2xl border border-blue-100"
            >
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-gray-900">Маркетплейс №1 в Україні</p>
                <p className="text-xs text-gray-600">
                  Понад 1 мільйон товарів від перевірених продавців
                </p>
                <div className="flex justify-center space-x-1 mt-2">
                  {[...Array(5)].map(() => (
                    <div key={Math.random()} className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Padding для кращого скролінгу */}
          <div className="h-4"></div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
