import { useSearchParams } from "react-router-dom";
import PinForm from "../components/PinForm";
import PropertyListItem from "../components/PropertyListItem";
import StepIndicator from "../components/StepIndicator";
import { getPropertiesByPin } from "../utils/lookup";
import { validatePin } from "../utils/validators";

export const BUY_STEPS = ["Area", "Properties", "Details", "Date", "Time", "Confirm"];

// Steps 1-2 of buying: enter a PIN (kept in the URL so Back from details returns here), then list.
export default function BuyList() {
  const [params, setParams] = useSearchParams();
  const pin = params.get("pin") ?? "";
  const hasPin = pin !== "" && !validatePin(pin);
  const list = hasPin ? getPropertiesByPin(pin) : [];

  return (
    <div className="narrow">
      <h1>Buying a Property</h1>
      <StepIndicator steps={BUY_STEPS} current={hasPin ? 2 : 1} />

      {!hasPin ? (
        <div className="card step-card">
          <PinForm
            label="Enter the Area PIN Code"
            buttonLabel="Enter"
            initialValue=""
            onSubmit={(value) => setParams({ pin: value })}
          />
        </div>
      ) : (
        <section aria-labelledby="list-title">
          <div className="list-head">
            <h2 id="list-title">Properties in {pin}</h2>
            <button type="button" className="link-button" onClick={() => setParams({})}>
              Change PIN
            </button>
          </div>
          {list.length === 0 ? (
            <p className="notice">No properties are listed in this area yet.</p>
          ) : (
            <ul className="property-list" aria-label={`${list.length} properties`}>
              {list.map((p) => (
                <PropertyListItem key={p.id} property={p} />
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
