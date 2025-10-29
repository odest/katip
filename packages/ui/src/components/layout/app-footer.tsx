"use client";

import { ReactNode } from "react";

interface AppFooterProps {
  children: ReactNode;
}

export function AppFooter({ children }: AppFooterProps) {
  return (
    <footer className="flex h-16 shrink-0 items-center gap-2 rounded-bl-lg rounded-br-lg border-t transition-[width,height] ease-linear bg-background">
      <div className="flex w-full items-center justify-center px-4 lg:px-6">
        {children}
      </div>
    </footer>
  );
}
