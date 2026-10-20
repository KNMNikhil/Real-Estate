import { services } from "../data/dummyData";

export default function Services() {
  return (
    <div className="narrow">
      <h1>Services</h1>
      <ul className="service-list">
        {services.map((service, i) => (
          <li key={service} className="service-list__item card">
            <span className="service-list__num">{i + 1}</span>
            <span>{service}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
