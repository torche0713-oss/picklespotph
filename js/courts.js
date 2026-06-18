// ============================================================
// COURTS DATA - Philippine Pickleball Courts Database
// ============================================================

const COURTS_DATA = [
  {
    id: 1,
    name: "Rizal Memorial Sports Complex",
    city: "Malate",
    province: "Metro Manila",
    region: "NCR",
    type: "Indoor",
    access: "Paid",
    courts: 6,
    address: "Pablo Ocampo Sr. St, Malate, Manila",
    hours: "Mon-Sun 6:00 AM - 10:00 PM",
    contact: "facebook.com/rizalmemorialsportscomplex",
    lat: 14.5579,
    lng: 120.9936,
    amenities: ["parking", "lights", "shower"],
    notes: "Professional courts with hardwood flooring. Rates apply per hour.",
    verified: true,
    featured: false,
    photos: [],
    dateAdded: "2024-01-15"
  },
  {
    id: 2,
    name: "McKinley Hill Pickleball",
    city: "Taguig",
    province: "Metro Manila",
    region: "NCR",
    type: "Outdoor",
    access: "Paid",
    courts: 4,
    address: "McKinley Hill, Taguig City",
    hours: "Mon-Sun 6:00 AM - 9:00 PM",
    contact: "@mckinleyhillpickleball",
    lat: 14.5456,
    lng: 121.0535,
    amenities: ["parking", "lights", "rental"],
    notes: "Newly built outdoor courts with LED lighting. Equipment rental available.",
    verified: true,
    featured: false,
    photos: [],
    dateAdded: "2024-02-01"
  },
  {
    id: 3,
    name: "BGC Pickleball Hub",
    city: "Bonifacio Global City",
    province: "Metro Manila",
    region: "NCR",
    type: "Outdoor",
    access: "Paid",
    courts: 8,
    address: "26th St, Bonifacio Global City, Taguig",
    hours: "Mon-Sun 5:00 AM - 11:00 PM",
    contact: "bgcpickleballhub.com",
    lat: 14.5502,
    lng: 121.0504,
    amenities: ["parking", "lights", "rental", "cafe"],
    notes: "Premier pickleball facility in BGC. Lessons and clinics available.",
    verified: true,
    featured: false,
    photos: [],
    dateAdded: "2024-01-20"
  },
  {
    id: 4,
    name: "Ortigas Pickleball Court",
    city: "Pasig",
    province: "Metro Manila",
    region: "NCR",
    type: "Indoor",
    access: "Members Only",
    courts: 3,
    address: "ADB Avenue, Ortigas Center, Pasig",
    hours: "Mon-Fri 6:00 AM - 10:00 PM, Sat-Sun 7:00 AM - 8:00 PM",
    contact: "ortigasmpc@gmail.com",
    lat: 14.5873,
    lng: 121.0617,
    amenities: ["parking", "shower", "lights"],
    notes: "Members only facility. Inquire for guest passes.",
    verified: true,
    featured: false,
    photos: [],
    dateAdded: "2024-01-28"
  },
  {
    id: 5,
    name: "Quezon City Sports Club",
    city: "Quezon City",
    province: "Metro Manila",
    region: "NCR",
    type: "Indoor",
    access: "Paid",
    courts: 4,
    address: "Elliptical Road, Diliman, Quezon City",
    hours: "Daily 6:00 AM - 9:00 PM",
    contact: "qcsportsclub@yahoo.com",
    lat: 14.6514,
    lng: 121.0438,
    amenities: ["parking", "shower", "lights", "rental"],
    notes: "Part of multi-sport complex. Badminton and tennis also available.",
    verified: true,
    featured: false,
    photos: [],
    dateAdded: "2024-02-10"
  },
  {
    id: 6,
    name: "Alabang Pickleball Courts",
    city: "Muntinlupa",
    province: "Metro Manila",
    region: "NCR",
    type: "Outdoor",
    access: "Free",
    courts: 2,
    address: "Alabang Town Center Area, Muntinlupa",
    hours: "Daily 6:00 AM - 8:00 PM",
    contact: "@alabangpickleball",
    lat: 14.4193,
    lng: 121.0402,
    amenities: ["parking"],
    notes: "Public outdoor courts. First-come, first-served basis.",
    verified: false,
    featured: false,
    photos: [],
    dateAdded: "2024-03-01"
  },
  {
    id: 7,
    name: "Clark Pickleball Arena",
    city: "Angeles",
    province: "Pampanga",
    region: "Luzon",
    type: "Indoor",
    access: "Paid",
    courts: 6,
    address: "Clark Freeport Zone, Angeles, Pampanga",
    hours: "Daily 7:00 AM - 10:00 PM",
    contact: "clarkpickleballarena.com",
    lat: 15.1858,
    lng: 120.5660,
    amenities: ["parking", "lights", "shower", "rental", "cafe"],
    notes: "State-of-the-art facility with air-conditioning. Tournaments hosted regularly.",
    verified: true,
    featured: false,
    photos: [],
    dateAdded: "2024-01-10"
  },
  {
    id: 8,
    name: "Cebu Pickleball Center",
    city: "Cebu City",
    province: "Cebu",
    region: "Visayas",
    type: "Indoor",
    access: "Paid",
    courts: 5,
    address: "Banilad, Cebu City, Cebu",
    hours: "Mon-Sun 6:00 AM - 10:00 PM",
    contact: "cebupickleballcenter.ph",
    lat: 10.3289,
    lng: 123.9070,
    amenities: ["parking", "shower", "lights", "rental"],
    notes: "Largest pickleball facility in Visayas. A/C courts available.",
    verified: true,
    featured: false,
    photos: [],
    dateAdded: "2024-01-05"
  },
  {
    id: 9,
    name: "Davao Pickleball Club",
    city: "Davao City",
    province: "Davao del Sur",
    region: "Mindanao",
    type: "Outdoor",
    access: "Members Only",
    courts: 4,
    address: "Lanang, Davao City",
    hours: "Daily 5:30 AM - 9:00 PM",
    contact: "@davaopickleballclub",
    lat: 7.0736,
    lng: 125.6126,
    amenities: ["parking", "lights", "shower"],
    notes: "Members-based club. Regular tournaments and social games every weekend.",
    verified: true,
    featured: false,
    photos: [],
    dateAdded: "2024-02-15"
  },
  {
    id: 10,
    name: "Iloilo Pickleball Courts",
    city: "Iloilo City",
    province: "Iloilo",
    region: "Visayas",
    type: "Outdoor",
    access: "Free",
    courts: 2,
    address: "Pavia, Iloilo City",
    hours: "Daily 6:00 AM - 7:00 PM",
    contact: "@iloilopickleball",
    lat: 10.6965,
    lng: 122.5644,
    amenities: ["parking"],
    notes: "Public courts. Bring your own equipment.",
    verified: false,
    featured: false,
    photos: [],
    dateAdded: "2024-03-10"
  },
  {
    id: 11,
    name: "Tagaytay Highlands Pickleball",
    city: "Tagaytay",
    province: "Cavite",
    region: "Luzon",
    type: "Outdoor",
    access: "Members Only",
    courts: 2,
    address: "Tagaytay Highlands, Tagaytay City, Cavite",
    hours: "Daily 7:00 AM - 6:00 PM",
    contact: "tagaytayhighlands.com",
    lat: 14.0956,
    lng: 120.9626,
    amenities: ["parking", "shower", "cafe"],
    notes: "Scenic court with view of Taal Lake. Exclusive for Highlands members.",
    verified: true,
    featured: false,
    photos: [],
    dateAdded: "2024-02-20"
  },
  {
    id: 12,
    name: "Subic Bay Pickleball",
    city: "Olongapo",
    province: "Zambales",
    region: "Luzon",
    type: "Outdoor",
    access: "Paid",
    courts: 3,
    address: "Subic Bay Freeport Zone, Olongapo",
    hours: "Daily 7:00 AM - 8:00 PM",
    contact: "@subicpickleball",
    lat: 14.8017,
    lng: 120.2716,
    amenities: ["parking", "lights", "rental"],
    notes: "Breezy courts near the bay. Great for morning games.",
    verified: true,
    featured: false,
    photos: [],
    dateAdded: "2024-03-05"
  },
  {
    id: 13,
    name: "SM Mall of Asia Courts",
    city: "Pasay",
    province: "Metro Manila",
    region: "NCR",
    type: "Indoor",
    access: "Paid",
    courts: 3,
    address: "SM Mall of Asia Complex, Pasay City",
    hours: "Daily 8:00 AM - 10:00 PM",
    contact: "0917-XXX-XXXX",
    lat: 14.5352,
    lng: 120.9822,
    amenities: ["parking", "lights", "rental"],
    notes: "Indoor sports facility within the MOA complex.",
    verified: true,
    featured: false,
    photos: [],
    dateAdded: "2024-01-25"
  },
  {
    id: 14,
    name: "Cagayan de Oro Pickle Club",
    city: "Cagayan de Oro",
    province: "Misamis Oriental",
    region: "Mindanao",
    type: "Indoor",
    access: "Paid",
    courts: 2,
    address: "Carmen, Cagayan de Oro City",
    hours: "Mon-Sat 6:00 AM - 9:00 PM",
    contact: "@cdopickleclub",
    lat: 8.4542,
    lng: 124.6319,
    amenities: ["parking", "lights"],
    notes: "Newly opened facility. Beginners welcome.",
    verified: false,
    featured: false,
    photos: [],
    dateAdded: "2024-03-15"
  },
  {
    id: 15,
    name: "Bacolod Pickleball Sportsplex",
    city: "Bacolod",
    province: "Negros Occidental",
    region: "Visayas",
    type: "Indoor",
    access: "Paid",
    courts: 4,
    address: "Lacson Street, Bacolod City",
    hours: "Daily 6:00 AM - 10:00 PM",
    contact: "bacolodpickleball@gmail.com",
    lat: 10.6773,
    lng: 122.9511,
    amenities: ["parking", "shower", "lights", "cafe"],
    notes: "Full-service pickleball facility in the heart of Bacolod.",
    verified: true,
    featured: false,
    photos: [],
    dateAdded: "2024-02-05"
  }
];

// Amenity icons mapping
const AMENITY_ICONS = {
  parking: { icon: 'fa-car', label: 'Parking' },
  lights: { icon: 'fa-lightbulb', label: 'Night Lights' },
  rental: { icon: 'fa-table-tennis-paddle-ball', label: 'Equipment Rental' },
  shower: { icon: 'fa-shower', label: 'Shower/Locker' },
  cafe: { icon: 'fa-mug-hot', label: 'Café/Food' }
};

// Get unique cities
function getUniqueCities(courts) {
  return [...new Set(courts.map(c => c.city))];
}

// Get unique regions
function getUniqueRegions(courts) {
  return [...new Set(courts.map(c => c.region))];
}

// Filter courts
function filterCourts(courts, filters) {
  return courts.filter(court => {
    // Search filter
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !court.name.toLowerCase().includes(q) &&
        !court.city.toLowerCase().includes(q) &&
        !court.province.toLowerCase().includes(q) &&
        !court.region.toLowerCase().includes(q)
      ) return false;
    }

    // Region filter
    if (filters.region && court.region !== filters.region) return false;

    // Province filter
    if (filters.province && court.province !== filters.province) return false;

    // City filter
    if (filters.city && court.city !== filters.city) return false;

    // Type filter
    if (filters.types && filters.types.length > 0) {
      if (!filters.types.includes(court.type)) return false;
    }

    // Access filter
    if (filters.access && filters.access.length > 0) {
      if (!filters.access.includes(court.access)) return false;
    }

    // Amenities filter
    if (filters.amenities && filters.amenities.length > 0) {
      if (!filters.amenities.every(a => court.amenities.includes(a))) return false;
    }

    return true;
  });
}

// Sort courts
function sortCourts(courts, sortBy) {
  return [...courts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'region':
        return a.region.localeCompare(b.region);
      case 'type':
        return a.type.localeCompare(b.type);
      case 'newest':
        return new Date(b.dateAdded) - new Date(a.dateAdded);
      default:
        return 0;
    }
  });
}