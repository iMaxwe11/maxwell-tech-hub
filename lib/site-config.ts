export interface NavLink {
  href: string;
  label: string;
  hash?: boolean;
}

export type SocialLinkName = "GitHub" | "LinkedIn" | "Email";

export interface SocialLink {
  name: SocialLinkName;
  href: string;
  label: string;
  handle: string;
}

export const siteConfig = {
  name: "Maxwell Nixon",
  domain: "maxwellnixon.com",
  url: "https://maxwellnixon.com",
  githubUsername: "iMaxwe11",
  email: "mnixon112@outlook.com",
  phone: "609-923-9437",
  location: "Southampton, NJ",
  timezone: "America/New_York",
  resumePath: "/Maxwell_Nixon_Resume.docx",
  description:
    "Cloud-savvy IT technician and full-stack developer building automation tools, managing infrastructure, and engineering premium software experiences.",
  shortDescription:
    "Cloud-savvy IT technician and full-stack developer building premium software experiences.",
} as const;

export const socialLinks: SocialLink[] = [
  {
    name: "GitHub",
    href: "https://github.com/iMaxwe11",
    label: "@iMaxwe11",
    handle: "@iMaxwe11",
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/in/maxwell-nixon-90351627a",
    label: "Maxwell Nixon",
    handle: "Maxwell Nixon",
  },
  {
    name: "Email",
    href: `mailto:${siteConfig.email}`,
    label: siteConfig.email,
    handle: siteConfig.email,
  },
];

/**
 * Primary navigation shown on sub-pages.
 * Tight 6-item menu: Home · Projects · Tools · Arcade · Terminal · Contact.
 * The secondary experiences (Space, Weather, News, Blog, Status, Analytics)
 * live on the /projects hub page and in the footer.
 */
export const defaultNavLinks: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/tools", label: "Tools" },
  { href: "/play", label: "Arcade" },
  { href: "/terminal", label: "Terminal" },
  { href: "/contact", label: "Contact" },
];

/**
 * Home page nav uses hash anchors so in-page sections stay a click away,
 * while the "reach the full hub" affordance lives inline in the page content.
 */
export const homeNavLinks: NavLink[] = [
  { href: "#projects", label: "Projects", hash: true },
  { href: "#experience", label: "Experience", hash: true },
  { href: "/tools", label: "Tools" },
  { href: "/play", label: "Arcade" },
  { href: "/terminal", label: "Terminal" },
  { href: "#contact", label: "Contact", hash: true },
];

/**
 * Footer carries the full surface area — every removable route from the
 * primary nav is still discoverable here.
 */
export const footerNavLinks: NavLink[] = [
  { href: "/projects", label: "Projects" },
  { href: "/tools", label: "Tools" },
  { href: "/space", label: "Space" },
  { href: "/weather", label: "Weather" },
  { href: "/news", label: "News" },
  { href: "/blog", label: "Blog" },
  { href: "/play", label: "Arcade" },
  { href: "/terminal", label: "Terminal" },
  { href: "/status", label: "Status" },
  { href: "/analytics", label: "Analytics" },
  { href: "/contact", label: "Contact" },
];
