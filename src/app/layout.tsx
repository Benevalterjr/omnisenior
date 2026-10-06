import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "OmniSenior - Gestão Inteligente para ILPI",
  description: "Sistema integrado para Instituições de Longa Permanência para Idosos: Quadro de Plantão, Checagem de Medicamentos em Tempo Real, Prontuário e Rotina do Cuidador.",
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
