import { Search, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { MobileMenu } from "@/components/elements/MobileMenu/mobile-menu";

interface HeaderMobileProps {
  cartCount?: number;
}

export function HeaderMobile({ cartCount = 0 }: HeaderMobileProps) {
  return (
    <header className="sticky top-0 z-50 h-12 border-b bg-[#0E0D0D] px-4">
      <div className="flex h-full items-center justify-between">
        {/* Ліва частина */}
        <div className="flex items-center gap-2">
          <MobileMenu />
          <Link href="/">
            <Image
              src="/logo-klayk_optimized.svg"
              alt="KLAYK"
              width={80}
              height={16}
              priority
              className="h-4 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Права частина */}
        <div className="flex items-center gap-4">
          <Link href="/search" aria-label="Пошук">
            <Search className="h-6 w-6 text-white/90" />
          </Link>

          <Link href="/cart" className="relative" aria-label="Кошик">
            <ShoppingCart className="h-6 w-6 text-white/90" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
