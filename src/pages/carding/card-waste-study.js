import { useEffect } from "react";
import { useRouter } from "next/router";

export default function CardWasteStudyPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/carding?type=Card%20Waste%20Study");
  }, [router]);

  return null;
}
