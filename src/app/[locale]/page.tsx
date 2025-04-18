"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const t = useTranslations("HomePage");
  const locale = useLocale();
  const router = useRouter();
  const isRTL = locale === "fa";

  const changeLanguage = (newLocale: string) => {
    const currentPath = window.location.pathname;

    // If we're at the root path, just change the locale to the new locale
    if (currentPath === "/") {
      router.push(`/${newLocale}`);
    } else {
      // If we're not at the root path, we preserve the current path but switch the locale
      const basePath = currentPath.split("/").slice(2).join("/"); // Remove the current locale from path
      router.push(`/${newLocale}/${basePath}`);
    }
  };

  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      className="relative flex flex-col items-center justify-center h-screen overflow-hidden text-center"
    >
      {/* Background slideshow */}
      <div className="absolute inset-0 z-0 animate-fadeSlide">
        <div className="w-full h-full bg-black/50 absolute z-10" />
        <div className="slideshow">
          <div className="slide bg-[url('/orange1.jpg')]" />
          <div className="slide bg-[url('/orange2.jpg')]" />
          <div className="slide bg-[url('/orange3.jpg')]" />
        </div>
      </div>

      {/* Logo and App name */}
      <div className="flex relative z-20 mb-8 flex-col items-center">
        <Image src="/logo3.png" alt="Dr Orange Logo" width={100} height={100} />
        <h1 className="text-5xl font-bold text-white mt-4">Dr Orange</h1>
      </div>

      {/* Text content */}
      <div className="relative z-20">
        <h2 className="text-4xl font-bold mb-4 text-white">{t("welcome")}</h2>
        <p className="text-lg text-gray-200 mb-6">{t("instruction")}</p>
        <div className="space-x-4">
          <Link
            href={`${locale}/login`}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg shadow hover:bg-gray-700 transition"
          >
            {t("login")}
          </Link>
          <Link
            href={`${locale}/register`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-500 transition"
          >
            {t("register")}
          </Link>
        </div>

        {/* Language switcher buttons */}
        <div className="mt-6">
          <button
            onClick={() => changeLanguage("en")}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg shadow hover:bg-gray-700 transition"
          >
            English
          </button>
          <button
            onClick={() => changeLanguage("bn")}
            className="ml-2 px-4 py-2 bg-gray-800 text-white rounded-lg shadow hover:bg-gray-700 transition"
          >
            বাংলা
          </button>
          <button
            onClick={() => changeLanguage("cn")}
            className="ml-2 px-4 py-2 bg-gray-800 text-white rounded-lg shadow hover:bg-gray-700 transition"
          >
            中文
          </button>
          <button
            onClick={() => changeLanguage("fa")}
            className="ml-2 px-4 py-2 bg-gray-800 text-white rounded-lg shadow hover:bg-gray-700 transition"
          >
            فارسی
          </button>
        </div>
      </div>
    </main>
  );
}
