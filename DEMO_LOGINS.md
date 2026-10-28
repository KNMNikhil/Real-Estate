# Demo / test logins and dummy data

Everything below is for testing only. Replace before going live.

## Website: http://localhost:5174

### Admin portal (/admin/login), local dev server only
| Email | Code (OTP) |
|---|---|
| admin@livinggods.demo | 123456 |

Demo mode uses sample agents/deals saved in this browser (localStorage key `lg_admin_demo_v2`).
Nothing reaches the real database. The real admin needs `supabase/admin.sql`.

### Consultant / agent login (/consultant/login)
On the local dev server these demo logins ALWAYS work (sample appointments, ticks saved in this browser only, nothing sent to the database).
On the live site they work only after the consultant exists in Supabase (`schema.sql`, and `add_consultant_neethi.sql` for Neethi).
Login = contact number, password = `Agent@<PIN>`. Defined in `supabase/schema.sql`.
| Consultant | PIN | Login number | Password |
|---|---|---|---|
| Arun Prakash (Nandambakkam) | 600089 | 9840012345 | Agent@600089 |
| Meena Lakshmi (Parrys) | 600001 | 9841023456 | Agent@600001 |
| Suresh Babu (Adyar) | 600020 | 9842034567 | Agent@600020 |
| Priya Narayanan (Thiruvanmiyur) | 600041 | 9843045678 | Agent@600041 |
| PAFP Neethi (Manjampadi, Vellore) | 631051 | **8754913898** (9842393898 also works) | Agent@631051 (dummy) |

PAFP Neethi: customers see BOTH 9842393898 and 8754913898. His row is created by
`supabase/add_consultant_neethi.sql` (run it in the Supabase SQL editor).

### Other dummy values in the code
| Where | Value |
|---|---|
| `src/data/dummyData.js` `DEMO_OTP` | 123456 (customer OTP demo) |
| `src/data/dummyData.js` `demoUser` | demo customer "Ravi Kumar" |
| Buy/Sell PIN chips (`ContactFlow.jsx`) | 600089, 600001, 600020, 600041, 631051 |
| `src/data/dummyData.js` consultants | static fallback list if the database is unreachable |
| Neethi photo | `public/consultants/neethi.webp` |
| Buy/Sell enquiries | time slot is a placeholder `TBA-xxxxxx` (no real time) |
