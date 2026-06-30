import { useEffect } from "react";
import { useRouter } from "next/router";

export default function TrialsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/carding?type=Trials%20Data%20Entry%20Form");
  }, [router]);

  return null;
}
