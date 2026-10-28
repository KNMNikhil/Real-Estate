import { useEffect, useState } from "react";
import { consultants as staticConsultants } from "../data/dummyData";
import { fetchConsultants } from "../lib/api";

let cache = null;

// Consultants for the buy / sell flows: loaded from the database (includes ones the admin added),
// starting with the built-in samples so the page never waits on the network.
export default function useConsultants() {
  const [list, setList] = useState(cache ?? staticConsultants);
  useEffect(() => {
    let alive = true;
    fetchConsultants()
      .then((rows) => {
        cache = rows;
        if (alive) setList(rows);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return list;
}
