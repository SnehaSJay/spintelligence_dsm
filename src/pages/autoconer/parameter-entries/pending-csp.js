import { useEffect } from "react";
import { useRouter } from "next/router";

export default function PendingCspPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/autoconer?type=CSP%20Parameter%20Entries");
  }, [router]);

  return null;
}
