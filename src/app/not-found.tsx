import { StatusLink, StatusPage } from "@/components/StatusPage";

export default function NotFound() {
  return (
    <StatusPage
      message="We couldn't find the page you were looking for."
      title="Page not found"
    >
      <StatusLink href="/">Continue shopping</StatusLink>
    </StatusPage>
  );
}
