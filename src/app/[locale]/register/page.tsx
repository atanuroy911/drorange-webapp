"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const t = useTranslations("RegisterPage");
  const locale = useLocale();

  const handleRegister = async () => {
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(t("successMessage"));
        setTimeout(() => router.push("/login"), 2000);
      } else {
        toast.error(data.message || t("errorMessage"));
      }
    } catch (err) {
      toast.error(t("genericError"));
      console.log(err);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 h-screen relative">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      {/* Left Panel */}
      <motion.div
        className="hidden md:flex items-center justify-center relative overflow-hidden"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        <div className="absolute inset-0 bg-[url('/orange2.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-black/50" />
        <h1 className="relative z-10 text-white text-4xl font-bold p-10 text-center">
          {t("joinUs")}
        </h1>
      </motion.div>

      {/* Right Panel */}
      <motion.div
        className="flex flex-col items-center justify-center p-6"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        {/* Logo and Site Name */}
        <div className="mb-6 text-center">
          <Image src="/logo3.png" alt="Dr Orange Logo" width={80} height={80} className="mx-auto" />
          <h1 className="text-3xl font-bold text-green-500 mt-2">Dr. Orange</h1>
        </div>

        <Card className="w-full max-w-md rounded-2xl shadow-xl p-4">
          <CardContent>
            <h2 className="text-2xl font-semibold mb-4 text-center text-green-600">{t("register")}</h2>
            <div className="space-y-4">
              <Input
                placeholder={t("username")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Input
                type="password"
                placeholder={t("password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button className="w-full bg-green-500 hover:bg-green-600" onClick={handleRegister}>
                {t("register")}
              </Button>
              <div className="flex justify-between text-sm pt-2">
                <Link href={`\\${locale}/login`} className="text-green-600 hover:underline">
                  {t("login")}
                </Link>
                <Link href={`\/${locale}`} className="text-green-500 hover:underline">
                  {t("backToHome")}
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
