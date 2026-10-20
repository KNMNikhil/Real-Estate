// current is 1-based. Labels of non-active steps are hidden on narrow screens via CSS.
export default function StepIndicator({ steps, current }) {
  return (
    <ol className="steps" aria-label={`Step ${current} of ${steps.length}`}>
      {steps.map((label, i) => {
        const n = i + 1;
        const state = n < current ? "done" : n === current ? "active" : "todo";
        return (
          <li
            key={label}
            className={`steps__item steps__item--${state}`}
            aria-current={state === "active" ? "step" : undefined}
          >
            <span className="steps__dot">{state === "done" ? "✓" : n}</span>
            <span className="steps__label">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
