import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import ConsultantCard from "../components/ConsultantCard";
import Modal from "../components/Modal";
import { submitTbcEnquiry } from "../lib/api";
import useConsultants from "../utils/useConsultants";
import { cleanPhone, validateContact, validateEmail, validateName } from "../utils/validators";

const TEAMS = [
  { code: "RI", name: "Relatives India Team" },
  { code: "FI", name: "Friends India Team" },
  { code: "ABR", name: "Any Buyer Random Team" },
];

// "Get started": shows the TBC consultant and collects the prospective TBC customer's details.
export default function TbcGetStarted() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const consultant = useConsultants()[0];
  const project = params.get("project") === "baba-pasumai-nagar" ? "Baba Pasumai Nagar" : "";

  const [v, setV] = useState({ name: "", email: "", phone: "", team: "", members: "", note: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const errors = {
    name: validateName(v.name),
    email: validateEmail(v.email),
    phone: validateContact(v.phone),
    team: v.team ? "" : "Please choose your team category.",
    members: v.members && !/^\d{1,3}$/.test(v.members) ? "Enter a number." : "",
  };
  const shown = submitted ? errors : {};
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: k === "phone" ? cleanPhone(e.target.value) : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.values(errors).some(Boolean)) return;
    setSending(true);
    setError("");
    try {
      await submitTbcEnquiry({
        consultantId: consultant.id,
        name: v.name.trim(),
        email: v.email.trim(),
        phone: v.phone.trim(),
        team: v.team,
        members: v.members,
        project,
        note: v.note.trim(),
      });
      setDone(true);
    } catch (err) {
      setError(err.message || "Could not send your details. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const field = (k, label, props) => (
    <div className="field">
      <label htmlFor={`tbc-${k}`} className="field__label">{label}</label>
      <input
        id={`tbc-${k}`}
        className={`input ${shown[k] ? "input--error" : ""}`}
        value={v[k]}
        onChange={set(k)}
        aria-invalid={shown[k] ? "true" : "false"}
        {...props}
      />
      {shown[k] && <p className="field__error" role="alert">{shown[k]}</p>}
    </div>
  );

  return (
    <div className="tbc site-main">
      <header className="tbc__page-head">
        <span className="tbc__badge tbc__badge--dark">TBC · Get started</span>
        <h1>Join as Team; Be Ready for a Smart Buy</h1>
        <p className="muted">
          Meet your TBC consultant and tell us about your team. {project && <>You are interested in <strong>{project}</strong>.</>}
        </p>
      </header>

      <div className="tbc__start">
        {consultant && <ConsultantCard consultant={consultant} title="Your TBC consultant" />}

        <form className="card tbc__form" onSubmit={submit} noValidate>
          <h2>Your details</h2>
          {field("name", "Full name", { type: "text", autoComplete: "name", placeholder: "Enter your full name" })}
          {field("email", "Email address", { type: "email", autoComplete: "email", placeholder: "you@gmail.com" })}
          {field("phone", "Phone number", {
            type: "tel", inputMode: "numeric", autoComplete: "tel-national", placeholder: "10-digit mobile number",
          })}

          <fieldset className="tbc__pick">
            <legend className="field__label">Team category</legend>
            <div className="tbc__pick-grid">
              {TEAMS.map((t) => (
                <label key={t.code} className={`tbc__pick-opt ${v.team === t.code ? "is-on" : ""}`}>
                  <input type="radio" name="team" value={t.code} checked={v.team === t.code} onChange={set("team")} />
                  <strong>{t.code}</strong>
                  <span>{t.name}</span>
                </label>
              ))}
            </div>
            {shown.team && <p className="field__error" role="alert">{shown.team}</p>}
          </fieldset>

          {field("members", "Number of buyers in your team (optional)", { type: "text", inputMode: "numeric", placeholder: "e.g. 5" })}
          <div className="field">
            <label htmlFor="tbc-note" className="field__label">Anything you would like us to know (optional)</label>
            <textarea id="tbc-note" className="input" rows={3} value={v.note} onChange={set("note")} />
          </div>

          <p className="consent">
            By continuing you agree to our <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.
          </p>
          {error && <p className="notice notice--error" role="alert">{error}</p>}
          <div className="actions">
            <Link to="/tbc" className="btn btn--ghost">Back</Link>
            <button type="submit" className="btn btn--primary" disabled={sending}>
              {sending ? "Sending…" : "Submit"}
            </button>
          </div>
        </form>
      </div>

      {done && (
        <Modal
          title="Thank you"
          actions={<button type="button" className="btn btn--primary" autoFocus onClick={() => navigate("/")}>Okay</button>}
        >
          <p>Thank you, <strong>{v.name.trim()}</strong>. We have your TBC details.</p>
          <p>
            {consultant ? <><strong>{consultant.name}</strong> will</> : "Your consultant will"} call you shortly. Please keep your phone nearby.
          </p>
        </Modal>
      )}
    </div>
  );
}
