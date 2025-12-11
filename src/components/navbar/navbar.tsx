"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletButton } from "@/components/wallet/custom-wallet";
import Image from "next/image";

const navItems = [
  { name: "Dashboard", path: "/" },
  { name: "Swap", path: "/swap" },
  { name: "History", path: "/history" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-(--gray-border) bg-(--black)">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
            <Image src="/senjalogodocs.png"
            alt="senja"
            width={40}
            height={40}/>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Senja
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`
                      relative px-4 py-2 font-medium transition-all duration-200
                      ${
                        isActive
                          ? "text-(--pink-primary) border-b-2 border-(--pink-primary)"
                          : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent"
                      }
                    `}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center">
            <div className="hidden md:block">
              <WalletButton />
            </div>
            <div className="md:hidden">
              <WalletButton />
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden border-t border-(--gray-border)">
        <div className="px-4 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  px-4 py-2 font-bold whitespace-nowrap text-sm transition-all duration-200 border-2
                  ${
                    isActive
                      ? "text-white bg-(--pink-primary) border-(--pink-primary)"
                      : "text-gray-300 bg-transparent border-(--gray-border) hover:border-(--pink-primary)"
                  }
                `}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
