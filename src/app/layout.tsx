import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionManager from "@/shared/components/SessionManager";
import { GoogleOAuthProvider } from '@react-oauth/google';
import config from '@/config';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RibbitTalk | Sign in",
  description: "RibbitTalk authentication page with a friendly green frog brand experience.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50 text-slate-900">
        <GoogleOAuthProvider clientId={config.google.clientId}>
          <SessionManager />
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
