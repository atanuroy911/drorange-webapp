"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const locale = useLocale();
  

  // Inside the component
  const t = useTranslations("LoginPage");

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Login successful");
        router.replace(`\\${locale}/dashboard`);
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (err) {
      toast.error("Something went wrong");
      console.log(err);
    }
  };

  return (
    <div className="relative grid grid-cols-1 md:grid-cols-2 h-screen">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      {/* Left side with background image + vignette */}
      <motion.div
        className="hidden md:flex items-center justify-center relative overflow-hidden"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/orange1.jpg')" }}
        />
        {/* Vignette Overlay */}
        <div className="absolute inset-0 bg-black/50" />
        {/* Text on top */}
        <div className="relative z-10 text-white text-4xl font-bold p-10">
        {t('welcomeBack')}
        </div>
      </motion.div>

      {/* Right side login form */}
      <motion.div
        className="flex flex-col items-center justify-center p-6"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        {/* Logo and Site Name */}
        <div className="flex flex-col items-center mb-6">
          <Image
            src="/logo3.png"
            alt="Dr Orange Logo"
            width={80}
            height={80}
            className="mb-2"
          />
          <h1 className="text-2xl font-bold text-orange-500">Dr Orange</h1>
        </div>

        {/* Card */}
        <Card className="w-full max-w-md rounded-2xl shadow-xl p-4">
          <CardContent>
            <h2 className="text-2xl font-semibold text-center mb-4 text-orange-500">
            {t('login')}
            </h2>
            <div className="space-y-4">
              <Input
                placeholder={t('username')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Input
                type="password"
                placeholder={t('password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                onClick={handleLogin}
              >
                {t('login')}
              </Button>
              <div className="flex justify-between text-sm pt-2">
                <Link
                  href={`\\${locale}/register`}
                  className="text-orange-500 hover:underline"
                >
                  {t('register')}
                </Link>
                <Link href={`\/${locale}`} className="text-gray-500 hover:underline">
                {t('backToHome')}
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
