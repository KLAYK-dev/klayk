import { useState } from "react";

export interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
}

export function useProductSearch() {
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    // Mock search implementation
    setTimeout(() => {
      const mockResults: Product[] = [
        { id: "1", title: `${query} item 1`, category: "Category 1", price: 100 },
        { id: "2", title: `${query} item 2`, category: "Category 2", price: 200 },
      ];
      setResults(mockResults);
      setIsLoading(false);
    }, 500);
  };

  return {
    results,
    isLoading,
    handleSearch,
  };
}
