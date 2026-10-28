import DemoBanner from "../components/DemoBanner";
import { useState } from "react";
import { Link } from "react-router-dom";
import Modal from "../components/Modal";
import SafeImage from "../components/SafeImage";
import { useAdmin } from "../context/AdminContext";
import {
  adminAddAgent,
  adminDeleteAgent,
  adminErrorMessage,
  adminSetPassword,
  isSessionError,
} from "../lib/admin";
import { initials } from "../utils/format";
import useAdminData, { agentStats } from "../utils/useAdminData";
import { validateContact, validateName, validatePin } from "../utils/validators";

const EMPTY = { name: "", pincode: "", areaName: "", contact: "", email: "", address: "", photo: "", password: "" };
const ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

// Random password for a new agent (no look-alike characters).
function makePassword(length = 10) {
  const bytes = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(bytes, (n) => ALPHABET[n % ALPHABET.length]).join("");
}

export default function AdminAgents() {
  const { token, logoutAdmin } = useAdmin();
  const { agents, deals, loading, error, reload } = useAdminData();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [created, setCreated] = useState(null); // credentials to hand to the new agent
  const [toDelete, setToDelete] = useState(null);
  const [pwFor, setPwFor] = useState(null);
  const [newPw, setNewPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [actionError, setActionError] = useState("");

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: "" }));
  };

  const fail = (e, setter) => {
    if (isSessionError(e)) logoutAdmin();
    else setter(adminErrorMessage(e));
  };

  const validate = () => {
    const er = {
      name: validateName(form.name),
      pincode: validatePin(form.pincode),
      areaName: form.areaName.trim().length < 2 ? "Please enter the area name." : "",
      contact: validateContact(form.contact),
      password: form.password.length < 8 ? "The password must be at least 8 characters." : "",
      email: form.email && !/^[^@\s]+@[^@\s]+\.[^@\s][^@\s]+$/.test(form.email) ? "Please enter a valid email." : "",
    };
    setErrors(er);
    return !Object.values(er).some(Boolean);
  };

  const add = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;
    setBusy(true);
    try {
      await adminAddAgent(token, { ...form, name: form.name.trim(), areaName: form.areaName.trim() });
      setCreated({ name: form.name.trim(), contact: form.contact, password: form.password });
      setForm(EMPTY);
      setOpen(false);
      reload();
    } catch (err) {
      fail(err, setFormError);
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    setBusy(true);
    setActionError("");
    try {
      await adminDeleteAgent(token, toDelete.id);
      setToDelete(null);
      reload();
    } catch (err) {
      setToDelete(null);
      fail(err, setActionError);
    } finally {
      setBusy(false);
    }
  };

  const savePassword = async () => {
    if (newPw.length < 8) return setPwError("The password must be at least 8 characters.");
    setBusy(true);
    setPwError("");
    try {
      await adminSetPassword(token, pwFor.id, newPw);
      setCreated({ name: pwFor.name, contact: pwFor.contact, password: newPw, reset: true });
      setPwFor(null);
      setNewPw("");
    } catch (err) {
      fail(err, setPwError);
    } finally {
      setBusy(false);
    }
  };

  const copy = async (c) => {
    try {
      await navigator.clipboard.writeText(`Living Gods consultant login\nContact number: ${c.contact}\nPassword: ${c.password}`);
    } catch {
      /* clipboard may be blocked; the details are on screen */
    }
  };

  const field = (k, label, props = {}) => (
    <div className="field">
      <label htmlFor={`ag-${k}`} className="field__label">{label}</label>
      <input
        id={`ag-${k}`}
        className={`input ${errors[k] ? "input--error" : ""}`}
        value={form[k]}
        onChange={set(k)}
        aria-invalid={errors[k] ? "true" : "false"}
        {...props}
      />
      {errors[k] && <p className="field__error" role="alert">{errors[k]}</p>}
    </div>
  );

  return (
    <div className="dash-home">
      <div className="title-row">
        <h1>Agents</h1>
        <button type="button" className="btn btn--gold btn--pill" onClick={() => setOpen((o) => !o)}>
          {open ? "Close" : "+ Add agent"}
        </button>
      </div>
      <p className="muted">Add or remove agents. The details you enter are the ones customers see on the website.</p>
      <DemoBanner />

      {error && <p className="notice notice--error" role="alert">{error}</p>}
      {actionError && <p className="notice notice--error" role="alert">{actionError}</p>}

      {created && (
        <section className="panel panel--ok" role="status">
          <h2>{created.reset ? "New password set" : "Agent added"}: {created.name}</h2>
          <p>Give these login details to the agent. The password is not shown again.</p>
          <dl className="creds">
            <div><dt>Login (contact number)</dt><dd>{created.contact}</dd></div>
            <div><dt>Password</dt><dd><code>{created.password}</code></dd></div>
          </dl>
          <div className="actions actions--end">
            <button type="button" className="btn btn--outline" onClick={() => copy(created)}>Copy details</button>
            <button type="button" className="btn btn--primary" onClick={() => setCreated(null)}>Done</button>
          </div>
        </section>
      )}

      {open && (
        <section className="panel">
          <h2>Add a new agent</h2>
          <form onSubmit={add} noValidate>
            <div className="form-grid">
              {field("name", "Agent name", { autoComplete: "off" })}
              {field("pincode", "Area PIN code", { inputMode: "numeric", maxLength: 6 })}
              {field("areaName", "Area name")}
              {field("contact", "Contact number (also the login)", { type: "tel", inputMode: "numeric", maxLength: 10 })}
              {field("email", "Email (optional)", { type: "email" })}
              {field("photo", "Photo link (optional)", { type: "url", placeholder: "https://…" })}
              <div className="field field--wide">
                <label htmlFor="ag-address" className="field__label">Address</label>
                <textarea id="ag-address" className="input" rows={2} value={form.address} onChange={set("address")} />
              </div>
              <div className="field field--wide">
                <label htmlFor="ag-password" className="field__label">Password for the agent</label>
                <div className="pw-gen">
                  <input
                    id="ag-password"
                    className={`input ${errors.password ? "input--error" : ""}`}
                    value={form.password}
                    onChange={set("password")}
                    autoComplete="off"
                  />
                  <button type="button" className="btn btn--outline" onClick={() => { setForm((f) => ({ ...f, password: makePassword() })); setErrors((er) => ({ ...er, password: "" })); }}>
                    Generate
                  </button>
                </div>
                {errors.password && <p className="field__error" role="alert">{errors.password}</p>}
              </div>
            </div>
            {formError && <p className="notice notice--error" role="alert">{formError}</p>}
            <div className="actions actions--end">
              <button type="submit" className="btn btn--primary" disabled={busy}>{busy ? "Saving…" : "Add agent"}</button>
            </div>
          </form>
        </section>
      )}

      {loading && <p className="muted">Loading agents…</p>}
      {!loading && agents.length === 0 && !error && <p className="notice">No agents yet.</p>}

      <ul className="agent-list">
        {agents.map((a) => {
          const s = agentStats(a.id, deals);
          return (
            <li key={a.id} className="agent-row panel">
              <SafeImage className="agent-row__photo" src={a.photo} alt={`Photo of ${a.name}`} fallbackText={initials(a.name)} />
              <div className="agent-row__info">
                <h3>{a.name}</h3>
                <p>{a.areaName} · PIN {a.pincode}</p>
                <p><a href={`tel:+91${a.contact}`}>{a.contact}</a>{a.email ? ` · ${a.email}` : ""}</p>
                {a.address && <p className="muted">{a.address}</p>}
                <p className="agent-row__stats">
                  <span><strong>{s.total}</strong> deals</span>
                  <span><strong>{s.called}</strong> calls attended</span>
                  <span><strong>{s.pending}</strong> still to call</span>
                </p>
              </div>
              <div className="agent-row__actions">
                <Link to={`/admin/agents/${a.id}`} className="btn btn--outline">View activity</Link>
                <button type="button" className="btn btn--ghost" onClick={() => { setPwFor(a); setNewPw(makePassword()); setPwError(""); }}>
                  Set password
                </button>
                <button type="button" className="btn btn--danger" onClick={() => setToDelete(a)}>Delete</button>
              </div>
            </li>
          );
        })}
      </ul>

      {toDelete && (
        <Modal
          title={`Delete ${toDelete.name}?`}
          onClose={() => setToDelete(null)}
          actions={
            <>
              <button type="button" className="btn btn--ghost" onClick={() => setToDelete(null)}>Cancel</button>
              <button type="button" className="btn btn--danger" onClick={confirmDelete} disabled={busy}>
                {busy ? "Deleting…" : "Delete agent"}
              </button>
            </>
          }
        >
          <p>
            This removes the agent from the website and deletes their {agentStats(toDelete.id, deals).total} booking(s).
            It cannot be undone.
          </p>
        </Modal>
      )}

      {pwFor && (
        <Modal
          title={`New password for ${pwFor.name}`}
          onClose={() => setPwFor(null)}
          actions={
            <>
              <button type="button" className="btn btn--ghost" onClick={() => setPwFor(null)}>Cancel</button>
              <button type="button" className="btn btn--primary" onClick={savePassword} disabled={busy}>
                {busy ? "Saving…" : "Save password"}
              </button>
            </>
          }
        >
          <p className="muted">The agent is signed out everywhere and must use this password next time.</p>
          <div className="pw-gen">
            <input className="input" value={newPw} onChange={(e) => { setNewPw(e.target.value); setPwError(""); }} aria-label="New password" />
            <button type="button" className="btn btn--outline" onClick={() => setNewPw(makePassword())}>Generate</button>
          </div>
          {pwError && <p className="field__error" role="alert">{pwError}</p>}
        </Modal>
      )}
    </div>
  );
}
