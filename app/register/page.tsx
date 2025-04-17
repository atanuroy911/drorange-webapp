// ----------------------------------------
// Register Page UI — app/register/page.tsx

"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("User registered. Redirecting to login...");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (err) {
      toast.error("Something went wrong");
      console.log(err);
      
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 h-screen">
      <motion.div 
        className="hidden md:flex items-center justify-center bg-blue-900 text-white text-3xl font-bold p-10"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        Join Us Today
      </motion.div>

      <motion.div 
        className="flex items-center justify-center p-6"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        <Card className="w-full max-w-md rounded-2xl shadow-xl p-4">
          <CardContent>
            <h2 className="text-2xl font-semibold mb-4">Register</h2>
            <div className="space-y-4">
              <Input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button className="w-full" onClick={handleRegister}>
                Register
              </Button>
              <div className="flex justify-between text-sm pt-2">
                <Link href="/login" className="text-blue-600 hover:underline">
                  Login
                </Link>
                <Link href="/" className="text-gray-500 hover:underline">
                  Back to Home
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}