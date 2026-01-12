"use client";

import { useState, useRef, useEffect } from "react";
import debounce from "lodash.debounce";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@klayk/ui/components/ui/command";
import { useFormStatus } from "react-dom";
import { PawPrint, Search } from "lucide-react";
import { Button } from "@klayk/ui/components/ui/button";
import { Skeleton } from "@klayk/ui/components/ui/skeleton";
import { useProductSearch } from "@/hooks/use-product-search";
import { useRouter } from "next/navigation";
import styles from "./SearchBar.module.css"; // обов'язково підключено CSS

export function SearchBar() {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { results, isLoading, handleSearch } = useProductSearch();
  const [showResults, setShowResults] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

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
  }, [query]);

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
    <div className="relative w-full max-w-2xl mx-auto">
      <form
        action={handleSubmit}
        className="relative flex items-center rounded-lg overflow-hidden border border-neutral-300 bg-white"
      >
        <Command className="w-full border-none">
          <div className={styles.inputWrapper}>
            <CommandInput
              ref={inputRef}
              name="q"
              value={query}
              onValueChange={setQuery}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder=""
              className={`h-10 text-base pl-10 pr-4 focus:outline-none focus:ring-0 border-none ${styles.commandInput}`}
            />
            {query.length === 0 && !isFocused && (
              <span className={styles.typewriterPlaceholder}>
                <Search className="h-4 w-4 text-muted-foreground" />
                <span>Шукайте товари в UNERA</span>
              </span>
            )}
          </div>
          {showResults && (
            <div className="absolute z-50 top-full left-0 mt-1 w-full bg-white rounded-lg shadow-lg">
              <CommandList>
                {isLoading ? (
                  <div className="p-4">
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : results.length > 0 ? (
                  <CommandGroup heading="Знайдені товари">
                    {results.map((product) => (
                      <CommandItem
                        key={product.id}
                        onSelect={() => onSelect(product.id)}
                        className="px-4 py-3 hover:bg-neutral-100 cursor-pointer"
                      >
                        <div>
                          <p className="font-medium">{product.title}</p>
                          <p className="text-sm text-neutral-500">
                            {product.category} • ${product.price}
                          </p>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : query.length > 0 && !isLoading ? (
                  <CommandEmpty className="p-4 text-center text-neutral-500">
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
      className="absolute right-0 h-11 px-6 bg-orange-600 text-white hover:bg-orange-700 rounded-none transition-colors"
      aria-label="Пошук"
    >
      Тицяй
      <PawPrint className="ml-2 h-6 w-6 stroke-current fill-current text-white transition-transform hover:rotate-12" />
    </Button>
  );
}
