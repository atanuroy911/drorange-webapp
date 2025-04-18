import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import { notFound } from 'next/navigation';
import { Toaster } from '@/components/ui/sonner';
import {routing} from '../../i18n/routing';
import '../globals.css'; // Don't forget your CSS

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dr Orange",
  description: "Your healthy fruit friend 🍊",
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  // Ensure that the incoming `locale` is valid
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  
  // 🛠 Load correct translation messages
  const messages = (await import(`../../../messages/${locale}.json`)).default;
 
  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>{children}</NextIntlClientProvider>
        <Toaster/>
      </body>
    </html>
  );
}