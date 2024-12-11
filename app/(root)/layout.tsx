import React from "react";
import Sidebar from "@/components/sidebar";
import MobileNavigation from "@/components/mobile-navigation";
import Header from "@/components/header";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { Toaster } from "@/components/ui/toaster";

export const dynamic = "force-dynamic";

const Layout = async ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const currentUser = await getCurrentUser();
  let isLoggedIn = true;
  if (!currentUser) {
    isLoggedIn = false;
  }
  return (
    <main className="flex h-screen">
      <Sidebar {...currentUser} isLoggedIn={isLoggedIn} />
      <section className="flex h-full flex-1 flex-col">
        <MobileNavigation {...currentUser} isLoggedIn={isLoggedIn} />
        <Header
          userId={currentUser ? currentUser.$id : ""}
          accountId={currentUser ? currentUser.accountId : ""}
          isLoggedIn={isLoggedIn}
        />
        <div className="main-content">{children}</div>
      </section>
      <Toaster />
    </main>
  );
};

export default Layout;
