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
      "https://picsum.photos/seed/p001a/800/500",
      "https://picsum.photos/seed/p001b/800/500",
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
    images: [],
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
    images: ["https://picsum.photos/seed/p003a/800/500"],
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
    images: ["https://picsum.photos/seed/p004a/800/500"],
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
      "https://picsum.photos/seed/p005a/800/500",
      "https://picsum.photos/seed/p005b/800/500",
      "https://picsum.photos/seed/p005c/800/500",
    ],
    consultantId: "C004",
    uploadedAt: "2026-10-17T16:45:00",
  },
];

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

This is a placeholder for the Memorandum of Understanding between Living Gods Real Estates (a unit of McCoy Engineering Private Limited) and the user.`;

// Valid PIN test cases:
// 600089 -> consultant C001 + 2 properties
// 600001 -> consultant C002 + 1 property
// 600020 -> consultant C003 + 1 property
// 600041 -> consultant C004 + 1 property
// 600999 -> valid format, no consultant ("No consultant available")
// 012345 -> invalid (cannot start with 0)
// 12345  -> invalid (must be 6 digits)
