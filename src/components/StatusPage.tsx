import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./StatusPage.module.css";

interface StatusPageProps {
  title: string;
  message: string;
  children: ReactNode;
}

export function StatusPage({ title, message, children }: StatusPageProps) {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.message}>{message}</p>
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
    <button className={styles.action} onClick={onClick} type="button">
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
    <Link className={styles.action} href={href}>
      {children}
    </Link>
  );
}
