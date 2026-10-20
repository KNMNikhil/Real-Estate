import { useEffect } from "react";

// Scrolls to the top whenever a multi-step flow moves to a new step.
export default function useScrollTop(step) {
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);
}
