import { useEffect } from "react";
import { useRouter } from "next/router";

export default function DrumWiseAppearancePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/autoconer?type=Drum%20wise%20Appearance");
  }, [router]);

  return null;
}
