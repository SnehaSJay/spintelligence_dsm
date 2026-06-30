import { useEffect } from "react";
import { useRouter } from "next/router";

export default function NatiDataPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/carding?type=Nati%20Data%20Entry");
  }, [router]);

  return null;
}
