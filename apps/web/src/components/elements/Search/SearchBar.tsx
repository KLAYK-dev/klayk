"use client";

import { Button } from "@klayk/ui/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@klayk/ui/components/ui/command";
import { Skeleton } from "@klayk/ui/components/ui/skeleton";
import { cn } from "@klayk/ui/lib/cn";
import { motion } from "framer-motion";
import debounce from "lodash.debounce";
import { PawPrint, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { type Product, useProductSearch } from "@/hooks/use-product-search";
import styles from "./SearchBar.module.css";

export function SearchBar() {
  const [query, setQuery] = useState("");

  const inputRef = useRef<HTMLDivElement>(null);

  const { results, isLoading, handleSearch } = useProductSearch();
  const [showResults, setShowResults] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useRef(
    debounce((q: string) => {
      handleSearch(q);
    }, 300),
  ).current;

  useEffect(() => {
    if (query.length > 0) {
      setShowResults(true);
      debouncedSearch(query);
    } else {
      setShowResults(false);
    }
  }, [query, debouncedSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const onSelect = (id: string) => {
    router.push(`/product/${id}`);
    setQuery("");
    setShowResults(false);
  };

  const handleSubmit = async (formData: FormData) => {
    const q = formData.get("q")?.toString() ?? "";
    await handleSearch(q);
    setShowResults(true);
  };

  return (
    <div ref={containerRef} className="relative w-full z-50 h-full flex items-center">
      {/* МОБІЛЬНА ВЕРСІЯ - тільки іконка (xs до lg) */}
      <motion.button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="lg:hidden p-2 rounded-lg border border-transparent text-white/90 hover:text-white 
                   hover:border-orange-500 hover:shadow-[0_0_10px_rgba(255,165,0,0.5)]
                   transition-all duration-200 flex items-center justify-center h-full"
        aria-label="Пошук"
      >
        <Search className="h-5 w-5 sm:h-6 sm:w-6 text-white/90 transition-colors shrink-0" />
      </motion.button>

      <MobileSearchModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setShowResults(false);
          setQuery("");
        }}
        query={query}
        onQueryChange={setQuery}
        results={results}
        isLoading={isLoading}
        onSelect={onSelect}
        handleSubmit={handleSubmit}
      />

      {/* ДЕСКТОПНА ВЕРСІЯ - повне поле пошуку (lg+) */}
      <form
        action={handleSubmit}
        className={cn(
          "hidden lg:flex group relative w-full h-12 items-center",
          "rounded-lg bg-white shadow-sm",
          "border border-neutral-300",
          "overflow-hidden",
          "transition-all duration-200 ease-out",
          "focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20",
        )}
      >
        <Command
          className="flex-1 h-full w-full bg-transparent border-none outline-none overflow-visible"
          shouldFilter={false}
        >
          <div className="relative flex h-full w-full items-center">
            {/* Іконка лупи */}
            <div className="absolute left-3 flex h-full items-center justify-center pointer-events-none z-10">
              <Search className="h-5 w-5 text-neutral-400" />
            </div>

            <CommandInput
              name="q"
              value={query}
              onValueChange={setQuery}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder=""
              className={cn(
                "h-full w-full pl-10 pr-4 py-0",
                "bg-transparent border-none ring-0 shadow-none outline-none",
                "text-base text-neutral-900 placeholder:text-transparent",
                "focus:ring-0 focus:outline-none focus:border-none",
                styles.commandInput,
              )}
            />

            {/* Placeholder */}
            {query.length === 0 && !isFocused && (
              <div
                className={cn(
                  styles.typewriterPlaceholder,
                  "absolute left-10 right-4 pointer-events-none",
                  "flex items-center h-full",
                  "text-neutral-400 select-none overflow-hidden whitespace-nowrap",
                )}
              >
                <span>Шукайте товари в KLAYK...</span>
              </div>
            )}
          </div>

          {/* Випадаючий список */}
          {showResults && (
            <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-white rounded-lg shadow-xl border border-neutral-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 z-50">
              <CommandList>
                {isLoading ? (
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-2/3" />
                  </div>
                ) : results.length > 0 ? (
                  <CommandGroup heading="Знайдені товари" className="text-neutral-500">
                    {results.map((product) => (
                      <CommandItem
                        key={product.id}
                        onSelect={() => onSelect(product.id)}
                        className="flex flex-col items-start px-4 py-3 cursor-pointer aria-selected:bg-orange-50 aria-selected:text-neutral-900"
                      >
                        <span className="font-medium text-neutral-900">{product.title}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                            {product.category}
                          </span>
                          <span className="text-sm font-bold text-orange-600">
                            ${product.price}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : query.length > 0 ? (
                  <CommandEmpty className="py-8 text-center text-neutral-500 text-sm">
                    Нічого не знайдено
                  </CommandEmpty>
                ) : null}
              </CommandList>
            </div>
          )}
        </Command>

        <SubmitButton />
      </form>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className={cn(
        "group h-full w-14 shrink-0",
        "rounded-none",
        "bg-orange-600 hover:bg-orange-700 text-white",
        "border-l border-orange-700/20",
        "transition-all duration-300",
        "focus-visible:ring-0 focus-visible:ring-offset-0",
        pending && "opacity-80 cursor-wait",
      )}
      aria-label="Знайти"
    >
      <PawPrint
        className={cn(
          "h-6 w-6 stroke-white fill-white/20 transition-transform duration-300 ease-out",
          "group-hover:rotate-12 group-hover:scale-110",
          pending && "animate-pulse",
        )}
      />
    </Button>
  );
}

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (q: string) => void;
  results: Product[];
  isLoading: boolean;
  onSelect: (id: string) => void;
  handleSubmit: (formData: FormData) => Promise<void>;
}

function MobileSearchModal({
  isOpen,
  onClose,
  query,
  onQueryChange,
  results,
  isLoading,
  onSelect,
  handleSubmit,
}: MobileSearchModalProps) {
  const [showResults, setShowResults] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex flex-col">
      {/* Header модалі */}
      <div className="bg-[#0E0D0D] border-b border-white/10 p-4 flex items-center gap-2">
        <button
          type="button"
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Закрити"
        >
          <X className="h-6 w-6 text-white" />
        </button>

        <form
          action={handleSubmit}
          className="flex-1 relative flex items-center rounded-lg bg-white shadow-sm border border-neutral-300 overflow-hidden"
        >
          <Command
            className="flex-1 h-12 w-full bg-transparent border-none outline-none"
            shouldFilter={false}
          >
            <div className="relative flex h-full w-full items-center">
              <div className="absolute left-3 flex h-full items-center justify-center pointer-events-none z-10">
                <Search className="h-5 w-5 text-neutral-400" />
              </div>

              <CommandInput
                name="q"
                value={query}
                onValueChange={(val) => {
                  onQueryChange(val);
                  if (val.length > 0) setShowResults(true);
                }}
                placeholder="Шукайте товари..."
                className={cn(
                  "h-full w-full pl-10 pr-4 py-0",
                  "bg-transparent border-none ring-0 shadow-none outline-none",
                  "text-base text-neutral-900 placeholder:text-neutral-400",
                  "focus:ring-0 focus:outline-none focus:border-none",
                  styles.commandInput,
                )}
              />
            </div>
          </Command>

          <Button
            type="submit"
            className="h-12 w-12 shrink-0 rounded-none bg-orange-600 hover:bg-orange-700 text-white border-l border-orange-700/20"
            aria-label="Знайти"
          >
            <PawPrint className="h-6 w-6 stroke-white fill-white/20" />
          </Button>
        </form>
      </div>

      {/* Результати пошуку */}
      {showResults && (
        <div className="flex-1 overflow-y-auto bg-white">
          <Command shouldFilter={false}>
            <CommandList>
              {isLoading ? (
                <div className="p-4 space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-2/3" />
                </div>
              ) : results.length > 0 ? (
                <CommandGroup heading="Знайдені товари" className="text-neutral-500">
                  {results.map((product) => (
                    <CommandItem
                      key={product.id}
                      onSelect={() => {
                        onSelect(product.id);
                        onClose();
                      }}
                      className="flex flex-col items-start px-4 py-3 cursor-pointer aria-selected:bg-orange-50 aria-selected:text-neutral-900"
                    >
                      <span className="font-medium text-neutral-900">{product.title}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                          {product.category}
                        </span>
                        <span className="text-sm font-bold text-orange-600">${product.price}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : query.length > 0 ? (
                <CommandEmpty className="py-8 text-center text-neutral-500 text-sm">
                  Нічого не знайдено
                </CommandEmpty>
              ) : null}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
