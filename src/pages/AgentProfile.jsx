import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AgentProfile() {
  const { agent, logoutAgent } = useAuth();
  const navigate = useNavigate();
  const rows = [
    ["Name", agent.name],
    ["Agent ID", agent.id],
    ["Area", agent.areaName],
    ["PIN code", agent.pincode],
    ["Contact number", agent.contact],
    ["Office address", agent.address],
  ];
  return (
    <div className="narrow">
      <h1>My Profile</h1>
      <div className="card">
        <dl className="profile__list">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <button
          type="button"
          className="btn btn--outline"
          onClick={() => {
            logoutAgent();
            navigate("/", { replace: true });
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
