import { useEffect } from "react";
import { useRouter } from "next/router";

export default function InspectionDataEntryPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/autoconer?type=Rewinding%20Study");
  }, [router]);

  return null;
}
