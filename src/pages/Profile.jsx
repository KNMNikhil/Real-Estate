import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="narrow">
      <h1>My Profile</h1>
      <div className="card">
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
        <button type="button" className="btn btn--outline" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
