import styles from "./LoadingBar.module.css";

interface LoadingBarProps {
  label: string;
}

export function LoadingBar({ label }: LoadingBarProps) {
  return (
    <div className={styles.bar} role="status">
      <span className={styles.label}>{label}</span>
    </div>
  );
}
