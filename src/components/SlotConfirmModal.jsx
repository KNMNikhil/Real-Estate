import { formatLongDate, formatTime } from "../utils/dates";
import Modal from "./Modal";

export default function SlotConfirmModal({ date, time, onConfirm, onChange, busy = false }) {
  return (
    <Modal
      title="Confirm your slot"
      onClose={onChange}
      actions={
        <>
          <button type="button" className="btn btn--ghost" onClick={onChange}>
            Change
          </button>
          <button type="button" className="btn btn--primary" onClick={onConfirm} autoFocus disabled={busy}>
            {busy ? "Saving…" : "Confirm"}
          </button>
        </>
      }
    >
      <p>
        You have selected <strong>{formatLongDate(date)}</strong> at{" "}
        <strong>{formatTime(time)}</strong>.
      </p>
    </Modal>
  );
}
