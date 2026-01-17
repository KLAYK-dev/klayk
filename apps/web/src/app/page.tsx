import { HeaderDesktop } from "@/components/widgets/Header/Header.Desktop";

export default function HomePage() {
  return (
    <>
      <HeaderDesktop cartCount={5} wishlistCount={2} compareCount={1} />
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold">Welcome to KLAYK</h1>
        <p className="mt-4 text-lg text-gray-600">Your multi-vendor marketplace.</p>
      </div>
    </>
  );
}
