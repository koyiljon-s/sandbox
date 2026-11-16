export type NavIconName = "home" | "land" | "economy" | "assets" | "mint";

export type NavItem = {
  href: string;
  label: string;
  caption: string;
  icon: NavIconName;
};

/** Ordered to follow the presentation story, top to bottom. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Overview", caption: "What is The Sandbox?", icon: "home" },
  { href: "/land", label: "LAND", caption: "Map & ESTATES", icon: "land" },
  { href: "/economy", label: "Economy", caption: "SAND token", icon: "economy" },
  { href: "/assets", label: "Assets", caption: "ERC-1155 items", icon: "assets" },
  { href: "/mint", label: "Mint", caption: "Testnet demo", icon: "mint" },
];

/** Routes where the sidebar starts collapsed to give the main visual more room. */
export const COLLAPSED_BY_DEFAULT = ["/land"];

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
