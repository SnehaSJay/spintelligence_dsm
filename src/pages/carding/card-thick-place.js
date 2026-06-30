import { useEffect } from "react";
import { useRouter } from "next/router";

export default function CardThickPlacePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/carding?type=Thick%20place%20%26%20CV");
  }, [router]);

  return null;
}
