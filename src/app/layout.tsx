"use client";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import theme from "./theme"; // We'll create this file next
import "./globals.css";
import { SidebarWithHeader } from './components/nav'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <ChakraProvider theme={theme}>
          <SidebarWithHeader>
            {children}
          </SidebarWithHeader>
        </ChakraProvider>
      </body>
    </html>
  )
}