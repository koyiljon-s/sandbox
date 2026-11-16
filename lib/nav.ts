import { IconCoin, IconCube, IconHome, IconMap2, IconSparkles, type Icon } from "@tabler/icons-react";

export type NavItem = {
  href: string;
  label: string;
  caption: string;
  icon: Icon;
};

/** Ordered to follow the presentation story, top to bottom. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Overview", caption: "What is The Sandbox?", icon: IconHome },
  { href: "/land", label: "LAND", caption: "Map & ESTATES", icon: IconMap2 },
  { href: "/economy", label: "Economy", caption: "SAND token", icon: IconCoin },
  { href: "/assets", label: "Assets", caption: "ERC-1155 items", icon: IconCube },
  { href: "/mint", label: "Mint", caption: "Testnet demo", icon: IconSparkles },
];

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
