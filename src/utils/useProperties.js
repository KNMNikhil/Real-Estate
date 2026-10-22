import { useEffect, useState } from "react";
import { fetchListings } from "../lib/api";
import { getAllProperties, mergeListings } from "./lookup";

// Marketplace data: sample properties plus listings saved in the database.
// Renders at once with what is local, then adds the database listings.
export default function useProperties() {
  const [list, setList] = useState(() => getAllProperties());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchListings()
      .then((db) => {
        if (alive && db) setList(mergeListings(db));
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return { properties: list, loading };
}
