import { Flame, Heart, Scale, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { NavIcon } from "@/components/client/NavIcon";
import { CatalogMenu } from "@/components/elements/CatalogHeader/CatalogMenu";
import { LanguageSwitcher } from "@/components/elements/LanguageElement/LanguageSwitcher";
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
      ariaLabel: "Вішліст",
    },
    {
      href: "/compare",
      icon: Scale,
      count: compareCount,
      title: "Порівняння",
      ariaLabel: "Порівняння",
    },
    { href: "/cart", icon: ShoppingCart, count: cartCount, title: "Кошик", ariaLabel: "Кошик" },
  ];

  return (
    <header className="sticky top-0 z-50 h-18 border-b bg-[#0E0D0D]">
      <div className="container mx-auto flex h-full items-center gap-6 px-4">
        {/* Лого */}
        <Link href="/" className="shrink-0">
          <Image
            src="/logo-klayk_optimized.svg"
            alt="KLAYK"
            width={120}
            height={32}
            priority
            className="h-8 w-auto object-contain"
          />
        </Link>

        <CatalogMenu />

        {/* Пошук */}
        <div className="flex-1 max-w-2xl">
          <SearchBar />
        </div>

        {/* Права секція */}
        <div className="flex items-center gap-5 border-l border-white/10 pl-5">
          <Link href="/deals" className="group flex flex-col items-center gap-1">
            <Flame className="h-6 w-6 text-red-600 transition-transform group-hover:scale-110" />
            <span className="text-xs text-white/80 group-hover:text-red-500">Акції</span>
          </Link>

          <LanguageSwitcher />
          <div className="h-8 w-px bg-white/10" />
          <ProfileButton />
          <div className="h-8 w-px bg-white/10" />

          <div className="flex items-center gap-3">
            {navIcons.map((item) => (
              <NavIcon key={item.href} {...item} />
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
