"use client";

import { Badge } from "@klayk/ui/components/ui/badge";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, Heart, Scale, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CatalogMenu } from "@/components/elements/CatalogHeader/CatalogMenu";
import { LanguageSwitcher } from "@/components/elements/LanguageElement/LanguageSwitcher";
import { MobileMenu } from "@/components/elements/MobileMenu/mobile-menu";
import ProfileButton from "@/components/elements/Profile/ProfileButton";
import { SearchBar } from "@/components/elements/Search/SearchBar";

interface HeaderDesktopProps {
  cartCount?: number;
  wishlistCount?: number;
  compareCount?: number;
}

export function HeaderDesktop({
  cartCount = 0,
  wishlistCount = 0,
  compareCount = 0,
}: HeaderDesktopProps) {
  const navIcons = [
    {
      href: "/wishlist",
      icon: Heart,
      count: wishlistCount,
      title: "Вішліст",
    },
    {
      href: "/compare",
      icon: Scale,
      count: compareCount,
      title: "Порівняння",
    },
    {
      href: "/cart",
      icon: ShoppingCart,
      count: cartCount,
      title: "Кошик",
    },
  ];

  return (
    <header className="w-full h-16 sm:h-16 lg:h-18 border-b bg-[#0E0D0DFF] sticky top-0 z-50 flex items-center transition-all duration-300 ease-out">
      <div className="container flex items-center gap-2 sm:gap-3 lg:gap-4 px-2 sm:px-4 lg:px-6">
        {/* 📱 Мобільне меню + Лого */}
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          <MobileMenu />
          <Link href="/" className="flex items-center shrink-0" title="На головну">
            <Image
              src="/logo-klayk_optimized.svg"
              alt="logo-KLAYK"
              width={120}
              height={32}
              priority
              className="h-6 sm:h-7 lg:h-8 w-auto object-contain"
            />
          </Link>
        </div>

        {/* 🗂 Каталог */}
        <nav className="hidden lg:flex items-center border-l border-white/10 pl-4 lg:pl-6">
          <CatalogMenu />
        </nav>

        {/* 🔍 Пошук */}
        <div className="flex-1 min-w-0 mx-2 sm:mx-3 lg:mx-4 flex justify-center lg:justify-start">
          <SearchBar />
        </div>

        {/* ⚙️ Правий блок */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-5 shrink-0 ml-auto lg:ml-0 border-l border-white/10 pl-2 sm:pl-3 lg:pl-5">
          {/* 🔥 Акції */}
          <Link
            href="/deals"
            className="hidden lg:flex flex-col items-center text-sm text-white/90 hover:text-red-500 p-1 rounded-md border border-transparent hover:border-red-500 transition-all duration-200"
            aria-label="Акції"
            title="Акції"
          >
            <Flame className="h-6 w-6 lg:h-8 lg:w-8 text-red-600 hover:text-red-500 transition-colors" />
          </Link>

          {/* 🌐 Мова */}
          <LanguageSwitcher />

          {/* 👤 Профіль */}
          <div className="h-6 lg:h-8 w-px bg-white/10 hidden lg:block" />
          <div className="hidden lg:flex flex-col items-center">
            <ProfileButton />
          </div>
          <div className="h-6 lg:h-8 w-px bg-white/10 hidden lg:block" />

          {/* 🧡 Вішліст | ⚖ Порівняння | 🛒 Кошик */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
            {navIcons.map(({ href, icon: Icon, count, title }) => (
              <motion.div
                key={href}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Link
                  href={href}
                  className="relative flex items-center justify-center p-1 rounded-md border border-transparent 
                             text-white/90 hover:text-white hover:border-orange-500 
                             hover:shadow-[0_0_10px_rgba(255,165,0,0.5)]
                             transition-all duration-200"
                  aria-label={title}
                  title={title}
                >
                  <motion.div
                    key={count}
                    initial={{ scale: 0.8, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white/90 hover:text-white transition-colors" />
                  </motion.div>

                  <AnimatePresence>
                    {count > 0 && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute -top-1 -right-1"
                      >
                        <Badge
                          variant="destructive"
                          className="text-xs h-4 w-4 p-0 flex items-center justify-center font-bold"
                        >
                          {count > 99 ? "99+" : count}
                        </Badge>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
