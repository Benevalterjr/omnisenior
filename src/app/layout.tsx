import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0f766e'
};

export const metadata: Metadata = {
  title: "OmniSenior - Gestão Inteligente para ILPI",
  description: "Sistema integrado para Instituições de Longa Permanência para Idosos: Quadro de Plantão, Checagem de Medicamentos em Tempo Real, Prontuário e Rotina do Cuidador.",
  icons: {
    icon: [
      { url: '/icon.svg?v=omnisenior-logo', type: 'image/svg+xml' }
    ],
    shortcut: '/icon.svg?v=omnisenior-logo',
    apple: '/icon.svg?v=omnisenior-logo',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-100 text-slate-900 min-h-screen antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
