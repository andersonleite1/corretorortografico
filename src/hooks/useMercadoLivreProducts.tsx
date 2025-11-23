"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { ProductData } from "@/services/productMetadata";

type ProductsContextValue = {
  products: ProductData[];
  loading: boolean;
  error?: string;
};

const MercadoLivreProductsContext = createContext<
  ProductsContextValue | undefined
>(undefined);

type ProviderProps = {
  children: React.ReactNode;
  initialProducts?: ProductData[];
  refreshOnClient?: boolean;
};

export function MercadoLivreProductsProvider({
  children,
  initialProducts = [],
  refreshOnClient = true,
}: ProviderProps) {
  const value = useMercadoLivreProductsState(initialProducts, refreshOnClient);
  return (
    <MercadoLivreProductsContext.Provider value={value}>
      {children}
    </MercadoLivreProductsContext.Provider>
  );
}

export function useMercadoLivreProducts() {
  const context = useContext(MercadoLivreProductsContext);

  if (!context) {
    throw new Error(
      "useMercadoLivreProducts must be used inside MercadoLivreProductsProvider"
    );
  }

  return context;
}

export function useMercadoLivreProductGroups() {
  const { products, loading, error } = useMercadoLivreProducts();

  const { smartphoneProducts, othersProducts } = useMemo(() => {
    const smartphoneProducts = products.filter(
      (product) => product.category?.toUpperCase() === "SMARTPHONE"
    );
    const othersProducts = products.filter(
      (product) => product.category?.toUpperCase() === "OTHERS"
    );

    return { smartphoneProducts, othersProducts };
  }, [products]);

  return {
    loading,
    smartphoneProducts,
    othersProducts,
    error,
  };
}

function useMercadoLivreProductsState(
  initialProducts: ProductData[],
  refreshOnClient: boolean
): ProductsContextValue {
  const [products, setProducts] = useState<ProductData[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!refreshOnClient) {
      return;
    }

    const controller = new AbortController();

    async function loadProducts() {
      try {
        const response = await fetch("/api/mercado-livre/products", {
          signal: controller.signal,
          headers: { accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as {
          products?: ProductData[];
        };

        setProducts(payload.products ?? []);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        console.error("[useMercadoLivreProducts] Failed to load products", err);
        setError("Não conseguimos carregar as ofertas agora. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }

    void loadProducts();

    return () => controller.abort();
  }, [refreshOnClient]);

  return { products, loading, error };
}
