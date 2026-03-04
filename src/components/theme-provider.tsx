"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  attribute,
  defaultTheme,
  enableSystem,
  disableTransitionOnChange,
  forcedTheme,
  storageKey,
  themes,
  enableColorScheme,
}: {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  forcedTheme?: string;
  storageKey?: string;
  themes?: string[];
  enableColorScheme?: boolean;
}) {
  // Explicitly passing props to NextThemesProvider instead of spreading ...props
  // to avoid Next.js 15 enumeration warnings if internal params are injected.
  return (
    <NextThemesProvider 
      attribute={attribute} 
      defaultTheme={defaultTheme} 
      enableSystem={enableSystem} 
      disableTransitionOnChange={disableTransitionOnChange}
      forcedTheme={forcedTheme}
      storageKey={storageKey}
      themes={themes}
      enableColorScheme={enableColorScheme}
    >
      {children}
    </NextThemesProvider>
  )
}
