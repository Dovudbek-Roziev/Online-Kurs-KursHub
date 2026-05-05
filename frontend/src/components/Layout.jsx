import Header from "./Header";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="pt-4 pb-16 px-6 lg:px-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
