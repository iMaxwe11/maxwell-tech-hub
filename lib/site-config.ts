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

export const defaultNavLinks: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/tools", label: "Tools" },
  { href: "/space", label: "Space" },
  { href: "/weather", label: "Weather" },
  { href: "/news", label: "News" },
  { href: "/play", label: "Arcade" },
  { href: "/contact", label: "Contact" },
];

export const homeNavLinks: NavLink[] = [
  { href: "#projects", label: "Projects", hash: true },
  { href: "#experience", label: "Experience", hash: true },
  { href: "/tools", label: "Tools" },
  { href: "/space", label: "Space" },
  { href: "/weather", label: "Weather" },
  { href: "/news", label: "News" },
  { href: "/play", label: "Arcade" },
  { href: "#contact", label: "Contact", hash: true },
];

export const footerNavLinks: NavLink[] = [
  { href: "#projects", label: "Projects", hash: true },
  { href: "#experience", label: "Experience", hash: true },
  { href: "/tools", label: "Tools" },
  { href: "/space", label: "Space" },
  { href: "/play", label: "Arcade" },
  { href: "#contact", label: "Contact", hash: true },
];
