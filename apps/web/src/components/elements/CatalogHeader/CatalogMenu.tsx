"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@klayk/ui/components/ui/accordion";
import { Button } from "@klayk/ui/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@klayk/ui/components/ui/sheet";
import { cn } from "@klayk/ui/lib/cn";
import {
  Baby,
  ChevronRight,
  Footprints,
  Home as HomeIcon,
  LayoutGrid,
  Menu,
  Shirt,
  Smartphone,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

// --- Types ---
interface Category {
  title: string;
  href: string;
  icon: React.ElementType;
  image?: string;
  subcategories: {
    title: string;
    items: { label: string; href: string }[];
  }[];
}

// --- Data ---
const categories: Category[] = [
  {
    title: "Жінкам",
    href: "/women",
    icon: Shirt,
    image: "/images/promo-women.jpg",
    subcategories: [
      {
        title: "Одяг",
        items: [
          { label: "Сукні", href: "/women/dresses" },
          { label: "Футболки", href: "/women/t-shirts" },
          { label: "Джинси", href: "/women/jeans" },
        ],
      },
      {
        title: "Взуття",
        items: [
          { label: "Кросівки", href: "/women/sneakers" },
          { label: "Туфлі", href: "/women/shoes" },
        ],
      },
    ],
  },
  {
    title: "Чоловікам",
    href: "/men",
    icon: Footprints,
    image: "/images/promo-men.jpg",
    subcategories: [
      {
        title: "Одяг",
        items: [
          { label: "Костюми", href: "/men/suits" },
          { label: "Худі", href: "/men/hoodies" },
        ],
      },
      {
        title: "Взуття",
        items: [{ label: "Кеди", href: "/men/sneakers" }],
      },
    ],
  },
  {
    title: "Дітям",
    href: "/kids",
    icon: Baby,
    subcategories: [
      {
        title: "Хлопчикам",
        items: [{ label: "Шкільна форма", href: "/kids/school" }],
      },
    ],
  },
  {
    title: "Електроніка",
    href: "/electronics",
    icon: Smartphone,
    image: "/images/promo-tech.jpg",
    subcategories: [
      {
        title: "Телефони",
        items: [
          { label: "Apple", href: "/iphone" },
          { label: "Samsung", href: "/samsung" },
        ],
      },
    ],
  },
  {
    title: "Дім",
    href: "/home",
    icon: HomeIcon,
    subcategories: [
      {
        title: "Меблі",
        items: [{ label: "Дивани", href: "/home/sofas" }],
      },
    ],
  },
  {
    title: "Краса",
    href: "/beauty",
    icon: Sparkles,
    subcategories: [
      {
        title: "Догляд",
        items: [{ label: "Креми", href: "/beauty/creams" }],
      },
    ],
  },
];

export function CatalogMenu() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState<Category>(categories[0]);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) setActiveCategory(categories[0]);
  }, [isOpen]);

  return (
    <>
      {/* --- Overlay Backdrop --- */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:block hidden" />
      )}

      {/* Контейнер */}
      <div className="relative z-50" ref={menuRef}>
        {/* === BUTTON WRAPPER === */}
        <div className="flex">
          {/* Mobile Trigger */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10 border-2" type="button">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] overflow-y-auto p-0">
                <SheetHeader className="p-4 border-b text-left">
                  <SheetTitle className="flex items-center gap-2">
                    <LayoutGrid className="h-5 w-5 text-primary" />
                    Каталог товарів
                  </SheetTitle>
                </SheetHeader>
                <div className="p-4">
                  <Accordion type="single" collapsible className="w-full">
                    {categories.map((category) => (
                      <AccordionItem key={category.title} value={category.title}>
                        <AccordionTrigger className="text-base font-medium py-4">
                          <div className="flex items-center gap-3">
                            <category.icon className="h-5 w-5 text-muted-foreground" />
                            {category.title}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pl-8 flex flex-col gap-4 pt-2">
                            {category.subcategories.map((sub) => (
                              <div key={sub.title}>
                                <h4 className="font-semibold text-sm mb-2">{sub.title}</h4>
                                <div className="flex flex-col gap-2 border-l-2 pl-3">
                                  {sub.items.map((item) => (
                                    <Link
                                      key={item.href}
                                      href={item.href}
                                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                    >
                                      {item.label}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Trigger - ОНОВЛЕНО СТИЛІ ТУТ */}
          <Button
            variant="outline"
            size="lg"
            type="button"
            className={cn(
              "hidden md:flex gap-2 font-bold tracking-wide transition-all duration-300",
              // Базові стилі: Білий фон, чорний текст, оранжева обводка
              "bg-white text-black border-2 border-orange-500",
              // Ховер ефекти: легкий оранжевий фон, тінь
              "hover:bg-orange-50 hover:text-black hover:border-orange-600 hover:shadow-[0_0_15px_rgba(249,115,22,0.3)]",
              // Активний стан (коли меню відкрите)
              isOpen && "bg-orange-50 shadow-inner border-orange-600",
            )}
            onClick={() => setIsOpen(!isOpen)}
          >
            <LayoutGrid
              className={cn("h-5 w-5 transition-transform duration-300", isOpen && "rotate-45")}
            />
            КАТАЛОГ
          </Button>
        </div>

        {/* === DESKTOP MEGA MENU === */}
        {isOpen && (
          <div className="hidden md:block absolute top-full left-0 mt-2 w-[900px] lg:w-[1100px] xl:w-[1200px] bg-white rounded-xl shadow-2xl border border-border/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-[260px_1fr] min-h-[500px]">
              {/* Left Sidebar */}
              <div className="bg-gray-50/80 p-3 flex flex-col gap-1 border-r">
                {categories.map((category) => (
                  <button
                    key={category.href}
                    type="button"
                    onMouseEnter={() => setActiveCategory(category)}
                    className={cn(
                      "flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                      activeCategory.title === category.title
                        ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                        : "text-gray-600 hover:bg-white hover:text-gray-900",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <category.icon
                        className={cn(
                          "h-5 w-5",
                          activeCategory.title === category.title
                            ? "text-primary"
                            : "text-gray-400",
                        )}
                      />
                      {category.title}
                    </div>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 transition-transform",
                        activeCategory.title === category.title && "translate-x-1 text-primary",
                      )}
                    />
                  </button>
                ))}
              </div>

              {/* Right Content */}
              <div className="p-8 grid grid-cols-[1fr_240px] gap-8">
                {/* Links */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-4 content-start">
                  {activeCategory.subcategories.map((subcategory) => (
                    <div key={subcategory.title} className="space-y-3">
                      <Link
                        href="#"
                        className="font-bold text-gray-900 hover:text-primary transition-colors flex items-center gap-1 group"
                      >
                        {subcategory.title}
                        <ChevronRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </Link>
                      <ul className="space-y-2">
                        {subcategory.items.map((item) => (
                          <li key={item.label}>
                            <Link
                              href={item.href}
                              className="text-sm text-gray-500 hover:text-gray-900 hover:underline hover:decoration-primary/50 underline-offset-4 transition-all block"
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Promo Card */}
                <div className="hidden lg:block">
                  <div className="relative h-full w-full rounded-xl overflow-hidden bg-gray-100 group">
                    {activeCategory.image ? (
                      <Image
                        src={activeCategory.image}
                        alt={activeCategory.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-300">
                        <activeCategory.icon className="h-20 w-20 opacity-20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                      <p className="text-white font-bold text-lg leading-tight mb-2">
                        Найкраще для категорії {activeCategory.title}
                      </p>
                      <Button size="sm" variant="secondary" className="self-start" type="button">
                        Перейти до розділу
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
