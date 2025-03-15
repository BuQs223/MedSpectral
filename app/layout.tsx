import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/app/components/Header"
import Footer from "./components/Footer"
import type React from "react"
import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from "next"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MedSpectra Connect",
  description: "Healthcare platform connecting patients and medical professionals",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <AuthProvider>
        <body className={`${inter.className} min-h-screen bg-background text-foreground`}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <main>{children}</main>
            <Footer />
            <Toaster />
          </ThemeProvider>
        </body>
        </AuthProvider>
      </html>
    </ClerkProvider>
  )
}



import './globals.css'
import { AuthProvider } from "@/utils/auth"
