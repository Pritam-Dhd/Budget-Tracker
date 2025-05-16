import React from "react";
import Link from "next/link";
import { PiggyBank } from "lucide-react";

const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-2">
      <PiggyBank className="stroke h-11 w-11 stroke-sky-400 stroke-[1.5]" />
      <p className="bg-gradient-to-r from-sky-300 to-sky-500 bg-clip-text text-3xl font-bold leading-tight tracking-tighter text-transparent ">
        Budget Tracker
      </p>
    </Link>
  );
};

export default Logo;
