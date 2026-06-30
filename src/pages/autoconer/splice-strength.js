import { useEffect } from "react";
import { useRouter } from "next/router";

export default function SpliceStrengthPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/autoconer?type=Splice%20Strength");
  }, [router]);

  return null;
}
