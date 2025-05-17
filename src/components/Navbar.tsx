"use client";
import React, { useState } from "react";
import Logo, { MobileLogo } from "./Logo";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "./ui/button";
import { ThemeSwicherBtn } from "./ThemeSwicherBtn";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Menu } from "lucide-react";

const Navbar = () => {
  return (
    <>
      <DesktopNavbar />
      <MobileNavbar />
    </>
  );
};

export default Navbar;

const DesktopNavbar = () => {
  return (
    <div className="hidden border-separate border-b bg-background md:block">
      <nav className="container flex items-center justify-between px-8">
        <div className="flex h-[80px] min-h-[60px] items-center gap-x-4">
          <Logo />
          <div className="flex h-full">
            {items.map((item) => (
              <NabarItem key={item.label} label={item.label} link={item.link} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <ThemeSwicherBtn />
          <SignedOut>
            <SignInButton />
            <SignUpButton />
          </SignedOut>
          <SignedIn>
            <UserButton afterSwitchSessionUrl="/" />
          </SignedIn>
        </div>
      </nav>
    </div>
  );
};

const MobileNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="block border-separate bg-background md:hidden">
      <nav className="container flex items-center justify-between px-8 ">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent
            className="w-[80vw] max-w-sm sm:w-[70vw] px-4 py-6"
            side="left"
          >
            <Logo />
            <div className="flex flex-col gap-4 pt-6">
              {items.map((item) => (
                <NabarItem
                  key={item.label}
                  label={item.label}
                  link={item.link}
                />
              ))}
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex items-center h-[80px] min-h-[60px] gap-x-2">
          <MobileLogo />
        </div>
        <div className="flex items-center gap-2">
          <ThemeSwicherBtn />
          <SignedOut>
            <SignInButton />
            <SignUpButton />
          </SignedOut>
          <SignedIn>
            <UserButton afterSwitchSessionUrl="/" />
          </SignedIn>
        </div>
      </nav>
    </div>
  );
};

const items = [
  {
    label: "Home",
    link: "/",
  },
  {
    label: "Dashboard",
    link: "/dashboard",
  },
  {
    label: "Transactions",
    link: "/transactions",
  },
  {
    label: "Manage",
    link: "/manage",
  },
];

const NabarItem = ({ label, link }: { label: string; link: string }) => {
  const pathname = usePathname();
  const isActive = pathname === link;
  return (
    <div className="relative flex items-center">
      <Link
        href={link}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "w-full justify-start text-lg text-muted-foreground hover:text-foreground",
          isActive && "text-foreground"
        )}
      >
        {label}
      </Link>
      {isActive && (
        <div className="absolute -bottom-[2px] left-1/2 hidden h-[2px] w-[80%] bg-foreground -translate-x-1/2 md:block rounded-xl" />
      )}
    </div>
  );
};
