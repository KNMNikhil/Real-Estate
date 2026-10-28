import { useAdmin } from "../context/AdminContext";
import { isDemoToken } from "../lib/admin";

// Shown only in the local demo session (sample data, nothing reaches the database).
export default function DemoBanner() {
  const { token } = useAdmin();
  if (!isDemoToken(token)) return null;
  return (
    <p className="notice" role="status">
      <strong>Demo mode:</strong> sample data kept in this browser only. Nothing is saved to the real database.
    </p>
  );
}
