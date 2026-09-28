import Link from "next/link";
import type { ReactNode } from "react";

// Styles live in globals.css: a CSS module here would be preloaded on every
// page through error.tsx/not-found.tsx and trigger an unused-preload warning.
interface StatusPageProps {
  title: string;
  message: string;
  children: ReactNode;
}

export function StatusPage({ title, message, children }: StatusPageProps) {
  return (
    <main className="status-page">
      <h1 className="status-title">{title}</h1>
      <p className="status-message">{message}</p>
      {children}
    </main>
  );
}

export function StatusButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button className="status-action" onClick={onClick} type="button">
      {children}
    </button>
  );
}

export function StatusLink({
  children,
  href,
}: {
  children: ReactNode;
  href: string;
}) {
  return (
    <Link className="status-action" href={href}>
      {children}
    </Link>
  );
}
