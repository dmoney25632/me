"use client";

import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "var(--background)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
          },
        }}
      />
    </>
  );
}
