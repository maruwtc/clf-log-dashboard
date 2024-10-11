"use client";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import theme from "./theme"; // We'll create this file next
import "./globals.css";
import { SidebarWithHeader } from './components/nav'
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/';
  return (
    <html lang='en'>
      <body>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <ChakraProvider theme={theme}>
          {isLogin ? (
            children
          ) : (
            <SidebarWithHeader>
              {children}
            </SidebarWithHeader>
          )}
        </ChakraProvider>
      </body>
    </html>
  )
}