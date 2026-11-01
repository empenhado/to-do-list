export function Container({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-8 lg:px-12">
      {children}
    </main>
  );
}