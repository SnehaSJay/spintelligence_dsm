import { useEffect } from "react";
import { useRouter } from "next/router";

export default function ConePackingAuditPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/autoconer?type=Cone%20Packing%20Audit");
  }, [router]);

  return null;
}
