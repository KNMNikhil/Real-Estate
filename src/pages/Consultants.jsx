import { useState } from "react";
import ConsultantCard from "../components/ConsultantCard";
import PinForm from "../components/PinForm";
import { findConsultantByPin } from "../utils/lookup";

export default function Consultants() {
  // result: null (nothing searched) | { pin, consultant | null }
  const [result, setResult] = useState(null);

  return (
    <div className="narrow">
      <h1>LG Consultants View</h1>
      <div className="card">
        <PinForm
          label="Enter the Area PIN Code"
          buttonLabel="Done"
          onChange={() => setResult(null)}
          onSubmit={(pin) => setResult({ pin, consultant: findConsultantByPin(pin) })}
        />
      </div>

      {result && (
        <div className="result" aria-live="polite">
          {result.consultant ? (
            <ConsultantCard consultant={result.consultant} />
          ) : (
            <p className="notice">No consultant available for this area yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
