import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProfileMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="profile" ref={wrapRef}>
      <button
        type="button"
        className="profile__button"
        aria-label="Open profile"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="8" r="4.2" />
          <path d="M3.5 21c0-4.4 3.8-7 8.5-7s8.5 2.6 8.5 7z" />
        </svg>
      </button>
      {open && (
        <div className="profile__panel" role="dialog" aria-label="Profile">
          <h2 className="profile__heading">My Profile</h2>
          <dl className="profile__list">
            <div>
              <dt>Name</dt>
              <dd>{user.name}</dd>
            </div>
            <div>
              <dt>Age</dt>
              <dd>{user.age}</dd>
            </div>
            <div>
              <dt>Contact Number</dt>
              <dd>{user.contact}</dd>
            </div>
          </dl>
          <button type="button" className="btn btn--outline btn--block" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
