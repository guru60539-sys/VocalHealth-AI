"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { UserDetailCotext } from "@/context/UserDetailContext";
import { Loader2 } from "lucide-react";

export type UserDetail = {
  name: string;
  email: string;
  credits: number;
};

function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = useUser();
  const [UserDetail, setUserDetail] = useState<any>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) CreateNewUser();
  }, [user]);

  const CreateNewUser = async () => {
    setLoading(true);
    try {
      const result = await axios.post("/api/users");
      setUserDetail(result.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="vocalhealth-theme"
    >
      <UserDetailCotext.Provider value={{ UserDetail, setUserDetail }}>
        {loading ? (
          <div className="flex h-screen w-screen items-center justify-center bg-background">
            <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
          </div>
        ) : (
          children
        )}
      </UserDetailCotext.Provider>
    </ThemeProvider>
  );
}

export default Provider;

