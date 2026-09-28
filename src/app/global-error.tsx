"use client";

import { StatusButton, StatusPage } from "@/components/StatusPage";
import "./globals.css";

export default function GlobalError({ retry }: { retry: () => void }) {
  return (
    <html lang="en">
      <body>
        <StatusPage
          message="The application couldn't start. Please try again."
          title="Something went wrong"
        >
          <StatusButton onClick={retry}>Retry</StatusButton>
        </StatusPage>
      </body>
    </html>
  );
}
