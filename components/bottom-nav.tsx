import Link from "next/link";

const links = [
  { href: "/home", label: "Home" },
  { href: "/path", label: "Path" },
  { href: "/checkin", label: "Check-in" },
  { href: "/profile", label: "You" },
] as const;

export function BottomNav({ active }: { active: (typeof links)[number]["href"] }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/90 backdrop-blur-md">
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {links.map((link) => {
          const isActive = active === link.href;
          return (
            <li key={link.href} className="flex-1">
              <Link
                href={link.href}
                className={`flex h-14 flex-col items-center justify-center text-xs tracking-wide transition-colors ${
                  isActive ? "text-fg" : "text-fg-dim hover:text-fg-muted"
                }`}
              >
                <span
                  className={`mb-1 h-1 w-1 rounded-full ${
                    isActive ? "bg-fg" : "bg-transparent"
                  }`}
                />
                <span className={isActive ? "font-medium" : ""}>{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
