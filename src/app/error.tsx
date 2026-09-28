"use client";

import { StatusButton, StatusPage } from "@/components/StatusPage";

export default function ErrorPage({ retry }: { retry: () => void }) {
  return (
    <StatusPage
      message="We couldn't load this page. Please try again."
      title="Something went wrong"
    >
      <StatusButton onClick={retry}>Retry</StatusButton>
    </StatusPage>
  );
}
