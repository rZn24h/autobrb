import { useEffect } from "react";
import app from "@/utils/firebase";

export function useAnalytics() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("firebase/analytics").then(({ getAnalytics }) => {
        getAnalytics(app);
      });
    }
  }, []);
} 