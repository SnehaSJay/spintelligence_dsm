import { useEffect } from "react";
import { useRouter } from "next/router";

export default function ConeDensityPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/autoconer?type=Cone%20Density");
  }, [router]);

  return null;
}
