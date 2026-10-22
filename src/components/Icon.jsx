// Stroke icons (Lucide-style paths) used by the sidebars.
const PATHS = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </>
  ),
  marketplace: (
    <>
      <path d="m2 7 4.4-4.4A2 2 0 0 1 7.8 2h8.4a2 2 0 0 1 1.4.6L22 7" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
      <path d="M2 7h20" />
      <path d="M22 7v3a2 2 0 0 1-2 2 2.7 2.7 0 0 1-2-.8 2.7 2.7 0 0 1-4 0 2.7 2.7 0 0 1-4 0A2.7 2.7 0 0 1 6 12a2 2 0 0 1-2 0 2 2 0 0 1-2-2V7" />
    </>
  ),
  buy: (
    <>
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
      <path d="M3 10a2 2 0 0 1 .7-1.5l7-6a2 2 0 0 1 2.6 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </>
  ),
  sell: (
    <>
      <path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z" />
      <circle cx="7.5" cy="7.5" r="0.5" fill="currentColor" />
    </>
  ),
  activities: (
    <>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  svcBuy: (
    <>
      <path d="M3 11 12 3l9 8" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h5" />
      <path d="M19 9.5V12" />
      <circle cx="16.5" cy="16.5" r="2.5" />
      <path d="m18.4 18.4 3 3M20.2 20.2l1.4-1.4" />
    </>
  ),
  svcSell: (
    <>
      <path d="M3 11 12 3l9 8" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4" />
      <path d="M19 9.5v2" />
      <circle cx="16.5" cy="16.5" r="5" fill="var(--icon-fill, #fff)" />
      <path d="M14.2 14.3h4.6M14.2 16.2h4.6M14.8 14.3c2.8 0 2.8 3.6 0 3.6h-.2l2.9 2.3" />
    </>
  ),
  svcManage: (
    <>
      <rect x="3" y="3" width="11" height="18" rx="1" />
      <path d="M6.5 7h1M10 7h1M6.5 11h1M10 11h1M6.5 15h1M10 15h1" />
      <path d="M8 21v-3h2v3" />
      <circle cx="18" cy="14" r="2.5" />
      <path d="M18 9.5v1.5M18 17v1.5M13.5 14H15M21 14h1.5M14.8 10.8l1 1M20.2 16.2l1 1M21.2 10.8l-1 1M15.8 16.2l-1 1" />
    </>
  ),
  svcLayout: (
    <>
      <rect x="3" y="3" width="18" height="15" rx="1.5" />
      <path d="M3 9h8M11 3v9M11 12h6M17 12v6" />
      <circle cx="17.5" cy="18" r="4" fill="var(--icon-fill, #fff)" />
      <path d="m15.6 18 1.4 1.4 2.6-2.8" />
    </>
  ),
  svcPlots: (
    <>
      <path d="M3 20 7 11h13l-3 9z" />
      <path d="M12.7 11 11 20M8.2 15.5h11" strokeDasharray="1.5 2" />
      <path d="M12 2.5a4 4 0 0 0-4 4c0 3 4 6 4 6s4-3 4-6a4 4 0 0 0-4-4z" fill="var(--icon-fill, #fff)" />
      <circle cx="12" cy="6.5" r="1.3" />
    </>
  ),
  typeApartment: (
    <>
      <rect x="5" y="2.5" width="14" height="19" rx="1.5" />
      <path d="M8.5 7h1.5M14 7h1.5M8.5 11h1.5M14 11h1.5M8.5 15h1.5M14 15h1.5" />
      <path d="M10.5 21.5v-3.5h3v3.5" />
    </>
  ),
  typeVilla: (
    <>
      <path d="M2.5 11 12 3l9.5 8" />
      <path d="M4.5 9.5V21h15V9.5" />
      <path d="M8 21v-5h8v5" />
      <path d="M8 12.5h2M14 12.5h2" />
      <path d="M17 4.5V7" />
    </>
  ),
  typeHouse: (
    <>
      <path d="M3 11 12 3l9 8" />
      <path d="M5 9.5V21h14V9.5" />
      <rect x="9.5" y="14" width="5" height="7" rx="0.5" />
    </>
  ),
  typeShop: (
    <>
      <path d="M3 9.5 4.5 4h15L21 9.5" />
      <path d="M3 9.5a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
      <path d="M4.5 12.5V21h15v-8.5" />
      <rect x="9.5" y="15" width="5" height="6" />
    </>
  ),
  contactMap: (
    <>
      <path d="m3 7 6-3 6 3 6-3v13l-6 3-6-3-6 3z" />
      <path d="M9 4v13M15 7v13" />
    </>
  ),
  contactPhone: (
    <>
      <path d="M5 4h3l2 5-2.2 1.4a11 11 0 0 0 5.8 5.8L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" />
    </>
  ),
  contactMail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  contactChat: (
    <>
      <path d="M4 5h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H9l-4 3.5V14H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
      <path d="M8 9h5M8 11.5h3M18.5 9H20a1 1 0 0 1 1 1v8l-3-2.5h-4a1 1 0 0 1-1-1v-1" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M10.7 5.1A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-2.6 3.5M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a10.3 10.3 0 0 0 5.4-1.5" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M2 2l20 20" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </>
  ),
};

export default function Icon({ name, size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
