"use client";

import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "rgba(10, 10, 10, 0.9)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#f4f4f5",
            backdropFilter: "blur(16px)",
          },
        }}
      />
    </>
  );
}
