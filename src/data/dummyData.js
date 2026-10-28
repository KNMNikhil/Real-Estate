// Local sample photos in /public/properties (10 files), picked by a stable hash of the seed.
const img = (seed) => `/properties/${(Array.from(seed).reduce((h, c) => h + c.charCodeAt(0), 0) % 10) + 1}.jpg`;

export const demoUser = {
  name: "Ravi Kumar",
  age: 34,
  contact: "9876543210",
};

export const DEMO_OTP = "123456";

export const consultants = [
  {
    id: "C001",
    name: "Arun Prakash",
    pincode: "600089",
    areaName: "Nandambakkam",
    contact: "9840012345",
    address: "No. 12, 3rd Cross Street, Nandambakkam, Chennai - 600089",
    photo: "https://i.pravatar.cc/300?img=12",
  },
  {
    id: "C002",
    name: "Meena Lakshmi",
    pincode: "600001",
    areaName: "Chennai GPO / Parrys",
    contact: "9841023456",
    address: "21, Armenian Street, Parrys, Chennai - 600001",
    photo: "https://i.pravatar.cc/300?img=32",
  },
  {
    id: "C003",
    name: "Suresh Babu",
    pincode: "600020",
    areaName: "Adyar",
    contact: "9842034567",
    address: "7, Lattice Bridge Road, Adyar, Chennai - 600020",
    photo: "https://i.pravatar.cc/300?img=15",
  },
  {
    id: "C004",
    name: "Priya Narayanan",
    pincode: "600041",
    areaName: "Thiruvanmiyur",
    contact: "9843045678",
    address: "45, East Coast Road, Thiruvanmiyur, Chennai - 600041",
    photo: "https://i.pravatar.cc/300?img=47",
  },
  {
    // Chief consultant, Tamil Nadu region. contact number shown to customers.
    id: "C005",
    name: "PAFP Neethi",
    pincode: "631051",
    areaName: "Manjampadi",
    contact: "9842393898",
    altContact: "8754913898", // second number, also shown to customers
    address: "1/128, Pillaiyar Kovil Street, Manjampadi, Attupakkam, Vellore, Tamil Nadu - 631051",
    photo: "/consultants/neethi.webp",
  },
];

export const properties = [
  {
    id: "P001",
    name: "Green Valley Apartments",
    type: "Apartment",
    pincode: "600089",
    area: "Nandambakkam",
    sqft: 1450,
    bedrooms: 3,
    bathrooms: 2,
    floor: "4th of 7",
    facing: "East",
    price: 8500000,
    address: "Plot 45, Ring Road, Nandambakkam, Chennai - 600089",
    description: "Spacious 3BHK with cross ventilation, covered parking and a children's play area.",
    images: [
      img("p001a"),
      img("p001b"),
    ],
    consultantId: "C001",
    uploadedAt: "2026-10-15T10:30:00",
  },
  {
    id: "P002",
    name: "Sunrise Villa",
    type: "Villa",
    pincode: "600089",
    area: "Nandambakkam",
    sqft: 2200,
    bedrooms: 4,
    bathrooms: 3,
    floor: "Ground + 1",
    facing: "North",
    price: 14500000,
    address: "12, Temple Street, Nandambakkam, Chennai - 600089",
    description: "Independent villa with private garden and terrace.",
    images: [img("sunrise-a"), img("sunrise-b")],
    consultantId: "C001",
    uploadedAt: "2026-09-20T09:00:00",
  },
  {
    id: "P003",
    name: "Heritage Court",
    type: "Apartment",
    pincode: "600001",
    area: "Chennai GPO / Parrys",
    sqft: 980,
    bedrooms: 2,
    bathrooms: 2,
    floor: "2nd of 5",
    facing: "West",
    price: 6200000,
    address: "10, Mint Street, Parrys, Chennai - 600001",
    description: "Well-maintained 2BHK near the metro station.",
    images: [img("p003a")],
    consultantId: "C002",
    uploadedAt: "2026-10-18T14:20:00",
  },
  {
    id: "P004",
    name: "Lakeview Plots",
    type: "Plot",
    pincode: "600020",
    area: "Adyar",
    sqft: 2400,
    bedrooms: null,
    bathrooms: null,
    floor: "N/A",
    facing: "South",
    price: 22000000,
    address: "Survey No. 88, Adyar, Chennai - 600020",
    description: "DTCP approved residential plot near the river.",
    images: [img("p004a")],
    consultantId: "C003",
    uploadedAt: "2026-10-10T11:00:00",
  },
  {
    id: "P005",
    name: "Palm Grove Independent House",
    type: "Independent House",
    pincode: "600041",
    area: "Thiruvanmiyur",
    sqft: 1800,
    bedrooms: 3,
    bathrooms: 3,
    floor: "G+1",
    facing: "East",
    price: 16800000,
    address: "5, Palm Grove Road, Thiruvanmiyur, Chennai - 600041",
    description: "Newly renovated independent house with terrace garden.",
    images: [
      img("p005a"),
      img("p005b"),
      img("p005c"),
    ],
    consultantId: "C004",
    uploadedAt: "2026-10-17T16:45:00",
  },
];



// More projects so the marketplace has something to browse. Pincodes match the consultants above.
export const moreProperties = [
  { id: "P006", name: "Orchid Heights", type: "Apartment", pincode: "600089", area: "Nandambakkam", sqft: 1120, bedrooms: 2, bathrooms: 2, floor: "6th of 9", facing: "North", price: 6900000, address: "21, Ring Road, Nandambakkam, Chennai - 600089", description: "Modern 2BHK with club house and gym access.", images: [img("p006a"), img("p006b")], consultantId: "C001", uploadedAt: "2026-10-12T10:00:00" },
  { id: "P007", name: "Silver Oak Plots", type: "Plot", pincode: "600089", area: "Nandambakkam", sqft: 1800, bedrooms: null, bathrooms: null, floor: "N/A", facing: "East", price: 9800000, address: "Survey No. 14, Nandambakkam, Chennai - 600089", description: "CMDA approved plots in a gated layout.", images: [img("p007a")], consultantId: "C001", uploadedAt: "2026-10-08T09:30:00" },
  { id: "P008", name: "Marina Residency", type: "Apartment", pincode: "600001", area: "Chennai GPO / Parrys", sqft: 1350, bedrooms: 3, bathrooms: 2, floor: "8th of 12", facing: "East", price: 11200000, address: "4, Beach Road, Parrys, Chennai - 600001", description: "Sea-facing 3BHK close to the business district.", images: [img("p008a"), img("p008b")], consultantId: "C002", uploadedAt: "2026-10-14T12:00:00" },
  { id: "P009", name: "Old Town Villa", type: "Villa", pincode: "600001", area: "Chennai GPO / Parrys", sqft: 2600, bedrooms: 4, bathrooms: 4, floor: "G+2", facing: "South", price: 24500000, address: "18, Armenian Street, Parrys, Chennai - 600001", description: "Heritage-style villa with courtyard and parking for three cars.", images: [img("p009a")], consultantId: "C002", uploadedAt: "2026-09-28T15:10:00" },
  { id: "P010", name: "Riverside Towers", type: "Apartment", pincode: "600020", area: "Adyar", sqft: 1650, bedrooms: 3, bathrooms: 3, floor: "10th of 14", facing: "North", price: 18900000, address: "9, Lattice Bridge Road, Adyar, Chennai - 600020", description: "Premium riverside apartment with 24x7 security.", images: [img("p010a"), img("p010b")], consultantId: "C003", uploadedAt: "2026-10-16T09:20:00" },
  { id: "P011", name: "Banyan House", type: "Independent House", pincode: "600020", area: "Adyar", sqft: 2100, bedrooms: 4, bathrooms: 3, floor: "G+1", facing: "West", price: 21500000, address: "3, Gandhi Nagar, Adyar, Chennai - 600020", description: "Corner house with a mature garden and car porch.", images: [img("p011a")], consultantId: "C003", uploadedAt: "2026-10-03T11:40:00" },
  { id: "P012", name: "Coastal Breeze Apartments", type: "Apartment", pincode: "600041", area: "Thiruvanmiyur", sqft: 1020, bedrooms: 2, bathrooms: 2, floor: "3rd of 6", facing: "East", price: 7600000, address: "27, East Coast Road, Thiruvanmiyur, Chennai - 600041", description: "Walkable to the beach and metro with covered parking.", images: [img("p012a"), img("p012b")], consultantId: "C004", uploadedAt: "2026-10-13T13:30:00" },
  { id: "P013", name: "Green Acres Plots", type: "Plot", pincode: "600041", area: "Thiruvanmiyur", sqft: 3000, bedrooms: null, bathrooms: null, floor: "N/A", facing: "North", price: 15500000, address: "Survey No. 52, Thiruvanmiyur, Chennai - 600041", description: "Residential plots with tarred roads and drainage.", images: [img("p013a")], consultantId: "C004", uploadedAt: "2026-09-25T10:15:00" },
];

const firstNames = ["Ravi", "Anita", "Karthik", "Divya", "Farhan", "Lakshmi", "Vignesh", "Sneha", "Arjun", "Pooja", "Suresh", "Harini"];
const lastNames = ["Kumar", "Sharma", "Iyer"];
// "Ravi Kumar" is first: he is the demo customer.
export const customerNames = lastNames.flatMap((last) => firstNames.map((first) => `${first} ${last}`));

export const bookedSlots = {
  C001: {
    "2026-10-22": ["10:00", "11:30"],
    "2026-10-23": ["15:00"],
  },
  C002: {
    "2026-10-20": ["09:30", "13:00"],
  },
  C003: {},
  C004: {
    "2026-10-21": ["16:00"],
  },
};

export const services = [
  "Buying of Property",
  "Selling of Property",
  "Property Management (Collection of Rent Out, Building Maintenance)",
  "Layout Approval",
  "Plots Promotions",
];

export const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
];

export const mouText = `[MOU content to be provided by the client.]

This is a placeholder for the Memorandum of Understanding between Living Gods Real Estates (a Unit of McCoy Engineering Private Limited) and the user.`;

// Valid PIN test cases:
// 600089 -> consultant C001 + 2 properties
// 600001 -> consultant C002 + 1 property
// 600020 -> consultant C003 + 1 property
// 600041 -> consultant C004 + 1 property
// 631051 -> consultant C005 (chief consultant, Manjampadi, Vellore)
// 600999 -> valid format, no consultant ("No consultant available")
// 012345 -> invalid (cannot start with 0)
// 12345  -> invalid (must be 6 digits)
