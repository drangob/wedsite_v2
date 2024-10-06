"use client";

import {
  Navbar,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@nextui-org/react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

import React from "react";

const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const pathname = usePathname();
  const isActive = (href: string) => {
    return pathname === href;
  };

  const menuItems = [
    { label: "Home", href: "/", active: isActive("/") },
    { label: "RSVP", href: "/rsvp", active: isActive("/rsvp") },
    { label: "Contact Us", href: "/contact", active: isActive("/contact") },
  ];

  return (
    <>
      <div className="flex h-16 w-screen flex-col items-center justify-center">
        <h2 className="font-playfair text-3xl font-light tracking-wide text-emerald-800">
          {process.env.NEXT_PUBLIC_COUPLE_NAME || "Wedding"}
        </h2>
      </div>
      <Navbar onMenuOpenChange={setIsMenuOpen}>
        <NavbarContent>
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="sm:hidden"
          />
        </NavbarContent>

        <NavbarContent className="hidden gap-4 sm:flex" justify="center">
          {menuItems.map(({ label, href, active }, index) => (
            <NavbarItem isActive={active} key={`full-${label}-${index}`}>
              <Link color={active ? "primary" : "foreground"} href={href}>
                {label}
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>
        <NavbarContent justify="end">
          <NavbarItem>
            <Button
              color="primary"
              href="#"
              variant="flat"
              onClick={() => signOut()}
            >
              Sign Out
            </Button>
          </NavbarItem>
        </NavbarContent>
        <NavbarMenu className="top-[calc(var(--navbar-height)+64px)]">
          {menuItems.map(({ label, href, active }, index) => (
            <NavbarMenuItem key={`mobile-${label}-${index}`}>
              <Link
                color={active ? "primary" : "foreground"}
                className="w-full"
                href={href}
                size="lg"
              >
                {label}
              </Link>
            </NavbarMenuItem>
          ))}
        </NavbarMenu>
      </Navbar>
    </>
  );
};

export default Navigation;
