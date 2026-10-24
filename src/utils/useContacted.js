import { useCallback, useState } from "react";
import { useAuth } from "../context/AuthContext";

// To-do ticks ("I have spoken to this customer"), kept in this browser per consultant.
export default function useContacted() {
  const { agent } = useAuth();
  const key = `lg_contacted_${agent?.id ?? agent?.contact ?? "consultant"}`;

  const read = () => {
    try {
      return new Set(JSON.parse(localStorage.getItem(key) || "[]"));
    } catch {
      return new Set();
    }
  };
  const [done, setDone] = useState(read);

  const toggle = useCallback(
    (id) => {
      setDone((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        try {
          localStorage.setItem(key, JSON.stringify([...next]));
        } catch {
          /* ignore: tick still works for this visit */
        }
        return next;
      });
    },
    [key]
  );

  return { done, toggle };
}
