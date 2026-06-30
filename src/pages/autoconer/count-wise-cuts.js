import { useEffect } from "react";
import { useRouter } from "next/router";

export default function CountWiseCutsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/autoconer?type=Count%20Wise%20Cuts%20Record");
  }, [router]);

  return null;
}
