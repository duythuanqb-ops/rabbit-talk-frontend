import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SessionManager from "@/shared/components/SessionManager";
import { GoogleOAuthProvider } from '@react-oauth/google';
import config from '@/config';
import { ThemeProvider } from "@/components/ThemeProvider";

const fontSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: 'swap',
});

const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | RibbitTalk',
    default: 'RibbitTalk',
  },
  description: "RibbitTalk: Interactive language learning platform with a friendly green frog brand experience.",
  icons: {
    icon: "/rabbit-mascot.png?v=1",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground font-sans selection:bg-emerald-200 selection:text-emerald-900 scroll-smooth">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <GoogleOAuthProvider clientId={config.google.clientId}>
            <SessionManager />
            {children}
          </GoogleOAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
