"use client"
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { toast } from "sonner";

export default function Debug() {
  const { getToken } = useAuth();

  useEffect(() => {
    getToken({ template: "convex" }).then(token =>
      toast.success("🔐 Clerk Convex JWT:", token)
    );
    // toast.success(token)
  }, []);

  return <div>Check console for token</div>;
}
