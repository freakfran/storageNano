"use client";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { navItems } from "@/constants";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import FileUploader from "@/components/file-uploader";
import { signOutUser } from "@/lib/actions/user.actions";

interface MobileNavigationProps {
  avatar: string;
  fullName: string;
  $id: string;
  accountId: string;
  email: string;
  isLoggedIn: boolean;
}

const MobileNavigation = ({
  avatar,
  fullName,
  $id: ownerId,
  accountId,
  email,
  isLoggedIn,
}: MobileNavigationProps) => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <header className="mobile-header">
      <Image
        src="/assets/icons/logo-full-brand.svg"
        alt="logo"
        width={120}
        height={52}
        className="h-auto"
      />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger>
          <Image
            src="/assets/icons/menu.svg"
            alt="menu"
            width={30}
            height={30}
          />
        </SheetTrigger>
        <SheetContent className="shad-sheet h-screen px-3">
          <SheetTitle>
            <div className="header-user">
              <Image
                src={avatar}
                alt="avatar"
                width={44}
                height={44}
                className="header-user-avatar"
              />
              <div className="sm:hidden lg:block">
                <p className="subtitle-2 capitalize">{fullName}</p>
                <p className="caption">{email}</p>
              </div>
            </div>
            <Separator className="mb-4 bg-light-200/20" />
          </SheetTitle>
          <nav className="mobile-nav">
            <ul className="mobile-nav-list">
              {navItems.map((item, index) => (
                <li key={index} className="lg:w-full">
                  <Link
                    href={item.url}
                    className={cn(
                      "mobile-nav-item",
                      pathname === item.url && "shad-active",
                    )}
                  >
                    <Image
                      src={item.icon}
                      alt={item.name}
                      width={24}
                      height={24}
                      className={cn(
                        "nav-icon",
                        pathname === item.url && "nav-icon-active",
                      )}
                    />
                    <p>{item.name}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Separator className="my-5 bg-light-200/20" />
          {isLoggedIn && (
            <div className="flex flex-col justify-between gap-5 pb-5">
              <FileUploader ownerId={ownerId} accountId={accountId} />
              <Button
                type="submit"
                className="mobile-sign-out-button"
                onClick={async () => await signOutUser()}
              >
                <Image
                  src="/assets/icons/logout.svg"
                  alt="sign out"
                  width={24}
                  height={24}
                />
                <p>Log out</p>
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default MobileNavigation;
