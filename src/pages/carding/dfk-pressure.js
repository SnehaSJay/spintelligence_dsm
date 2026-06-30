import { useEffect } from "react";
import { useRouter } from "next/router";

export default function DfkPressurePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/carding?type=Card%20DFK%20Pressure%20Checking");
  }, [router]);

  return null;
}
