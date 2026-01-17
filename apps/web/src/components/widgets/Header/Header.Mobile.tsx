"use client";

import { Badge } from "@klayk/ui/components/ui/badge";
import { motion } from "framer-motion";
import { Search, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { MobileMenu } from "@/components/elements/MobileMenu/mobile-menu";

interface HeaderMobileProps {
  cartCount?: number;
}

export function HeaderMobile({ cartCount = 0 }: HeaderMobileProps) {
  return (
    <header className="w-full h-14 border-b bg-[#0E0D0DFF] sticky top-0 z-50 flex items-center transition-all duration-300 ease-out">
      <div className="container flex items-center justify-between px-2 sm:px-4 w-full">
        {/* 📱 Мобільне меню + Лого */}
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          <MobileMenu />
          <Link href="/" className="flex items-center shrink-0" title="На головну">
            <Image
              src="/logo-klayk_optimized.svg"
              alt="logo-KLAYK"
              width={80}
              height={20}
              priority
              className="h-5 w-auto object-contain"
            />
          </Link>
        </div>

        {/* 🔍 Пошук + 🛒 Кошик */}
        <div className="flex items-center gap-2">
          {/* Пошук */}
          <Link
            href="/search"
            className="p-2 rounded-md border border-transparent text-white/90 hover:text-white 
                       hover:border-orange-500 hover:shadow-[0_0_10px_rgba(255,165,0,0.5)]
                       transition-all duration-200 flex items-center justify-center"
            aria-label="Пошук"
            title="Пошук"
          >
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Search className="h-5 w-5 text-white/90 transition-colors" />
            </motion.div>
          </Link>

          {/* Кошик */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="relative">
            <Link
              href="/cart"
              className="relative p-2 rounded-md border border-transparent text-white/90 hover:text-white 
                         hover:border-orange-500 hover:shadow-[0_0_10px_rgba(255,165,0,0.5)]
                         transition-all duration-200 flex items-center justify-center"
              aria-label="Кошик"
              title="Кошик"
            >
              <ShoppingCart className="h-5 w-5 text-white/90 transition-colors" />
              {cartCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 text-xs h-4 w-4 p-0 flex items-center justify-center font-bold"
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </Badge>
              )}
            </Link>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
