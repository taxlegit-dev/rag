import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center bg-gray-500">
        {children}
      </main>
      <Footer />
    </>
  );
}
