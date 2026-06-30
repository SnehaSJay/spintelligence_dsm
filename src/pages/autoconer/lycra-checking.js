import { useEffect } from "react";
import { useRouter } from "next/router";

export default function LycraCheckingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/autoconer?type=Lycra%20Checking");
  }, [router]);

  return null;
}
