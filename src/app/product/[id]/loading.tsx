import { LoadingBar } from "@/components/LoadingBar";

export default function Loading() {
  return (
    <main aria-busy="true">
      <LoadingBar label="Loading product details" />
    </main>
  );
}
