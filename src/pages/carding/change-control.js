import { useEffect } from "react";
import { useRouter } from "next/router";

export default function ChangeControlPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/carding?type=WheelChange");
  }, [router]);

  return null;
}
