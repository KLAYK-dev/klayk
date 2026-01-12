"use client";

import * as React from "react";
import Link from "next/link";
import { List, ChevronRight, LayoutGrid } from "lucide-react";
import { Button } from "@klayk/ui/components/ui/button";
import { cn } from "@klayk/lib/cn";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@klayk/ui/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@klayk/ui/components/ui/accordion";

interface Category {
  title: string;
  href: string;
  subcategories: {
    title: string;
    items: string[];
  }[];
}

const categories: Category[] = [
  {
    title: "Жінкам",
    href: "/women",
    subcategories: [
      {
        title: "Одяг",
        items: [
          "Сукні",
          "Футболки",
          "Спідниці",
          "Джинси",
          "Куртки",
          "Светри",
          "Блузки",
          "Костюми",
        ],
      },
      {
        title: "Взуття",
        items: [
          "Кросівки",
          "Туфлі",
          "Босоніжки",
          "Чоботи",
          "Балетки",
          "Кеди",
          "Черевики",
        ],
      },
      {
        title: "Аксесуари",
        items: [
          "Сумки",
          "Прикраси",
          "Годинники",
          "Окуляри",
          "Ремені",
          "Шарфи",
          "Рукавички",
        ],
      },
    ],
  },
  {
    title: "Чоловікам",
    href: "/men",
    subcategories: [
      {
        title: "Одяг",
        items: [
          "Футболки",
          "Джинси",
          "Костюми",
          "Куртки",
          "Светри",
          "Сорочки",
          "Штани",
        ],
      },
      {
        title: "Взуття",
        items: ["Кросівки", "Туфлі", "Черевики", "Кеди", "Мокасини", "Сандалі"],
      },
      {
        title: "Аксесуари",
        items: [
          "Годинники",
          "Ремені",
          "Гаманці",
          "Сумки",
          "Рюкзаки",
          "Окуляри",
        ],
      },
    ],
  },
  {
    title: "Дітям",
    href: "/kids",
    subcategories: [
      {
        title: "Дівчаткам",
        items: ["Сукні", "Футболки", "Штани", "Куртки", "Взуття", "Аксесуари"],
      },
      {
        title: "Хлопчикам",
        items: ["Футболки", "Штани", "Куртки", "Взуття", "Аксесуари"],
      },
      {
        title: "Немовлятам",
        items: ["Боді", "Повзунки", "Комбінезони", "Шапочки", "Пінетки"],
      },
    ],
  },
  {
    title: "Дім та сад",
    href: "/home",
    subcategories: [
      {
        title: "Меблі",
        items: ["Дивани", "Ліжка", "Столи", "Стільці", "Шафи", "Комоди"],
      },
      {
        title: "Текстиль",
        items: ["Постільна білизна", "Рушники", "Пледи", "Подушки", "Штори"],
      },
      {
        title: "Декор",
        items: ["Картини", "Вази", "Свічки", "Дзеркала", "Килими"],
      },
    ],
  },
  {
    title: "Краса та здоров'я",
    href: "/beauty",
    subcategories: [
      {
        title: "Косметика",
        items: [
          "Макіяж",
          "Догляд за обличчям",
          "Догляд за тілом",
          "Парфумерія",
        ],
      },
      {
        title: "Гігієна",
        items: ["Зубні щітки", "Шампуні", "Мило", "Дезодоранти"],
      },
      {
        title: "Здоров'я",
        items: ["Вітаміни", "Масажери", "Тонометри", "Ваги"],
      },
    ],
  },
  {
    title: "Електроніка",
    href: "/electronics",
    subcategories: [
      {
        title: "Смартфони та планшети",
        items: ["Телефони", "Планшети", "Аксесуари", "Захисні плівки"],
      },
      {
        title: "Комп'ютери",
        items: ["Ноутбуки", "Монітори", "Комплектуючі", "Периферія"],
      },
      {
        title: "Побутова техніка",
        items: ["Пральні машини", "Холодильники", "Пилососи", "Мікрохвильовки"],
      },
    ],
  },
];

export function CatalogMenu() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState<Category>(
    categories[0],
  );
  const [isMobile, setIsMobile] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "bg-white text-black border-2 border-white",
              "hover:bg-white/90 hover:border-green-500 hover:shadow-lg hover:shadow-green-200",
              "transition-all duration-200",
            )}
          >
            <LayoutGrid className="h-6 w-6 transform transition-transform duration-200 hover:rotate-12 stroke-current text-custom-orange" />
            <span className="sr-only text-base">Каталог</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[85vw] sm:w-[350px] overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>Категорії</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <Accordion type="single" collapsible className="w-full">
              {categories.map((category) => (
                <AccordionItem key={category.href} value={category.title}>
                  <AccordionTrigger className="py-3 text-base font-medium hover:text-purple-600 transition-colors">
                    {category.title}
                  </AccordionTrigger>
                  <AccordionContent>
                    {category.subcategories.map((subcategory) => (
                      <div key={subcategory.title} className="mb-3">
                        <h4 className="font-medium text-sm mb-2 text-black hover:text-black transition-colors">
                          {subcategory.title}
                        </h4>
                        <ul className="space-y-2">
                          {subcategory.items.map((item) => (
                            <li key={item}>
                              <Link
                                href="#"
                                className={cn(
                                  "text-sm text-black-700 hover:text-black-700",
                                  "flex items-center transition-all duration-200",
                                  "hover:translate-x-1 hover:font-medium",
                                )}
                              >
                                <ChevronRight className="h-3 w-3 mr-1 text-black-400 group-hover:text-black-500 transition-colors" />
                                {item}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="outline"
        size="lg"
        className={cn(
          "px-6 h-10 text-base font-medium",
          "bg-white text-black border-2 border-white",
          "hover:bg-black hover:text-white",
          "hover:border-orange-500",
          "transition-all duration-300",
          isOpen && "bg-white border-orange-500 shadow-lg shadow-primary/20",
          "flex items-center gap-2",
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <LayoutGrid className="h-16 w-16 transition-transform duration-200 group-hover:rotate-12" />
        Каталог
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[1200px] bg-white rounded-lg shadow-xl z-80 border border-black-100">
          <div className="grid grid-cols-[280px_1fr] divide-x">
            <div className="p-4 bg-black-50 rounded-l-lg">
              {categories.map((category) => (
                <button
                  key={category.href}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg",
                    "hover:bg-black-50 hover:text-black-700 transition-all duration-200",
                    "flex items-center justify-between group",
                    activeCategory.title === category.title &&
                      "bg-black-50 text-black-700 shadow-sm",
                  )}
                  onClick={() => setActiveCategory(category)}
                >
                  <span className="font-medium">{category.title}</span>
                  <ChevronRight className="h-4 w-4 text-black-400 group-hover:text-black-500 transition-colors" />
                </button>
              ))}
            </div>
            <div className="p-6 grid grid-cols-3 gap-8">
              {activeCategory.subcategories.map((subcategory) => (
                <div key={subcategory.title}>
                  <h3 className="font-bold text-black-900 mb-3 hover:text-black-700 transition-colors">
                    {subcategory.title}
                  </h3>
                  <ul className="space-y-2">
                    {subcategory.items.map((item) => (
                      <li key={item}>
                        <Link
                          href="#"
                          className={cn(
                            "text-sm text-black-600 hover:text-black-700",
                            "transition-all duration-200 inline-block",
                            "hover:translate-x-1 hover:font-medium",
                            "before:content-[''] before:block before:w-0 before:h-px",
                            "before:bg-black-700 before:transition-all before:duration-300",
                            "hover:before:w-full",
                          )}
                        >
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
