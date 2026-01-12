import { getDevice } from "@/components/widgets/Header/device";
import { getCartCount } from "@/components/widgets/Header/getCartCount";
import { getCompareCount } from "@/components/widgets/Header/getCompareCount";
import { getWishlistCount } from "@/components/widgets/Header/getWishlistCount";
import { HeaderDesktop } from "@/components/widgets/Header/Header.Desktop";
import { HeaderMobile } from "@/components/widgets/Header/Header.Mobile";

/**
 * Main Header Server Component
 * Автоматично визначає пристрій і рендерить відповідну версію
 * Дані (кошик, вішліст) завантажуються на сервері для швидкого First Paint
 */
export async function Header() {
  // Паралельне завантаження всіх даних (швидше ніж послідовне)
  const [device, cartCount, wishlistCount, compareCount] = await Promise.all([
    getDevice(),
    getCartCount(),
    getWishlistCount(),
    getCompareCount(),
  ]);

  // Next.js автоматично виключить непотрібний компонент з bundle
  if (device === "mobile") {
    return <HeaderMobile cartCount={cartCount} />;
  }

  return (
    <HeaderDesktop
      cartCount={cartCount}
      wishlistCount={wishlistCount}
      compareCount={compareCount}
    />
  );
}
