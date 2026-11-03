import type { Metadata } from 'next'
import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { ptBR } from '@clerk/localizations'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Minhas Tarefas',
  description: 'Gerenciador de tarefas com Next.js, Clerk e Prisma',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <ClerkProvider localization={ptBR}>
            <header className="flex justify-end items-center p-4 gap-4 h-16">
              <Suspense>
                <Show when="signed-out">
                  <SignInButton>
                    <button className="font-medium text-sm sm:text-base cursor-pointer">
                      Entrar
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="bg-primary text-primary-foreground rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer hover:opacity-90">
                      Criar conta
                    </button>
                  </SignUpButton>
                </Show>
                <Show when="signed-in">
                  <UserButton showName />
                </Show>
              </Suspense>
            </header>
            {children}
            <Toaster richColors />
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}