// variant "mark" = building icon only; "full" = icon with the brand lettering.
export default function Logo({ variant = "mark", size = 44 }) {
  const full = variant === "full";
  return (
    <img
      className={`logo ${full ? "logo--full" : ""}`}
      src={full ? "/logo-full.png" : "/logo-mark.png"}
      alt="Living Gods Real Estates logo"
      width={full ? undefined : size}
    />
  );
}
