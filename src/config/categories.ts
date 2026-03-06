// Shared categories configuration for the entire app

export interface CategoryInfo {
  id: string;
  hi: string;
  en: string;
  icon: string;
  group: string;
}

export const categoryGroups = {
  repair: { hi: "रिपेयर सेवाएं", en: "Repair Services" },
  cleaning: { hi: "सफाई सेवाएं", en: "Cleaning Services" },
  installation: { hi: "इंस्टॉलेशन", en: "Installation" },
  construction: { hi: "निर्माण कार्य", en: "Construction" },
  outdoor: { hi: "बाहरी सेवाएं", en: "Outdoor Services" },
  other: { hi: "अन्य सेवाएं", en: "Other Services" },
};

export const allCategories: CategoryInfo[] = [
  // Repair Services
  { id: "plumber", hi: "प्लंबर", en: "Plumber", icon: "🔧", group: "repair" },
  { id: "electrician", hi: "इलेक्ट्रीशियन", en: "Electrician", icon: "⚡", group: "repair" },
  { id: "carpenter", hi: "कारपेंटर", en: "Carpenter", icon: "🪚", group: "repair" },
  { id: "painter", hi: "पेंटर", en: "Painter", icon: "🎨", group: "repair" },
  { id: "acRepair", hi: "AC टेक्नीशियन", en: "AC Technician", icon: "❄️", group: "repair" },
  { id: "refrigeratorRepair", hi: "फ्रिज रिपेयर", en: "Refrigerator Repair", icon: "🧊", group: "repair" },
  { id: "washingMachineRepair", hi: "वॉशिंग मशीन रिपेयर", en: "Washing Machine Repair", icon: "🫧", group: "repair" },
  { id: "microwaveRepair", hi: "माइक्रोवेव रिपेयर", en: "Microwave Repair", icon: "📡", group: "repair" },
  { id: "roRepair", hi: "RO वॉटर प्यूरिफायर", en: "RO Water Purifier Repair", icon: "💧", group: "repair" },
  { id: "tvRepair", hi: "TV रिपेयर", en: "TV Repair", icon: "📺", group: "repair" },
  { id: "computerRepair", hi: "कंप्यूटर/लैपटॉप रिपेयर", en: "Computer/Laptop Repair", icon: "💻", group: "repair" },
  { id: "mobileRepair", hi: "मोबाइल रिपेयर", en: "Mobile Repair", icon: "📱", group: "repair" },
  { id: "appliance", hi: "अप्लायंस रिपेयर", en: "Appliance Repair", icon: "🔌", group: "repair" },
  { id: "generatorRepair", hi: "जनरेटर रिपेयर", en: "Generator Repair", icon: "🔋", group: "repair" },
  { id: "inverterRepair", hi: "इन्वर्टर/बैटरी रिपेयर", en: "Inverter/Battery Repair", icon: "🔌", group: "repair" },
  { id: "gasStoveRepair", hi: "गैस स्टोव रिपेयर", en: "Gas Stove Repair", icon: "🔥", group: "repair" },
  { id: "chimneyRepair", hi: "चिमनी रिपेयर", en: "Chimney Repair", icon: "🏭", group: "repair" },
  { id: "geyserRepair", hi: "गीजर रिपेयर", en: "Geyser Repair", icon: "🚿", group: "repair" },
  { id: "doorLockRepair", hi: "दरवाजा/ताला रिपेयर", en: "Door/Lock Repair", icon: "🔐", group: "repair" },
  { id: "glassRepair", hi: "कांच रिपेयर", en: "Glass Repair", icon: "🪟", group: "repair" },

  // Cleaning Services
  { id: "houseCleaning", hi: "घर की सफाई", en: "House Cleaning", icon: "🏠", group: "cleaning" },
  { id: "bathroomCleaning", hi: "बाथरूम सफाई", en: "Bathroom Cleaning", icon: "🚿", group: "cleaning" },
  { id: "kitchenCleaning", hi: "किचन सफाई", en: "Kitchen Cleaning", icon: "🍳", group: "cleaning" },
  { id: "sofaCleaning", hi: "सोफा सफाई", en: "Sofa Cleaning", icon: "🛋️", group: "cleaning" },
  { id: "carpetCleaning", hi: "कालीन सफाई", en: "Carpet Cleaning", icon: "🧹", group: "cleaning" },
  { id: "windowCleaning", hi: "खिड़की सफाई", en: "Window Cleaning", icon: "🪟", group: "cleaning" },
  { id: "waterTankCleaning", hi: "पानी टंकी सफाई", en: "Water Tank Cleaning", icon: "🪣", group: "cleaning" },
  { id: "cleaner", hi: "सफाई कर्मचारी", en: "Cleaner", icon: "✨", group: "cleaning" },
  { id: "pestControl", hi: "पेस्ट कंट्रोल", en: "Pest Control", icon: "🐛", group: "cleaning" },
  { id: "drainCleaning", hi: "नाली सफाई", en: "Drain Cleaning", icon: "🕳️", group: "cleaning" },

  // Installation
  { id: "cctvInstallation", hi: "CCTV इंस्टॉलेशन", en: "CCTV Installation", icon: "📹", group: "installation" },
  { id: "wifiSetup", hi: "इंटरनेट/WiFi सेटअप", en: "Internet/WiFi Setup", icon: "📶", group: "installation" },
  { id: "solarPanel", hi: "सोलर पैनल", en: "Solar Panel Installation", icon: "☀️", group: "installation" },
  { id: "curtainInstallation", hi: "पर्दे/ब्लाइंड्स", en: "Curtain/Blinds Installation", icon: "🪟", group: "installation" },

  // Construction
  { id: "mason", hi: "राज मिस्त्री", en: "Mason (Raj Mistri)", icon: "🧱", group: "construction" },
  { id: "tileMarbleRepair", hi: "टाइल/मार्बल रिपेयर", en: "Tile/Marble Repair", icon: "🔲", group: "construction" },
  { id: "falseCeiling", hi: "फॉल्स सीलिंग", en: "False Ceiling Work", icon: "🏗️", group: "construction" },
  { id: "aluminiumWork", hi: "एल्युमिनियम वर्क", en: "Aluminium Work", icon: "🪟", group: "construction" },
  { id: "weldingWork", hi: "वेल्डिंग वर्क", en: "Welding Work", icon: "⚙️", group: "construction" },
  { id: "interiorDesign", hi: "इंटीरियर डिज़ाइन", en: "Interior Design", icon: "🎨", group: "construction" },
  { id: "homeRenovation", hi: "घर रेनोवेशन", en: "Home Renovation", icon: "🏡", group: "construction" },
  { id: "furnitureAssembly", hi: "फर्नीचर असेंबली", en: "Furniture Assembly", icon: "🪑", group: "construction" },

  // Outdoor
  { id: "gardening", hi: "बागवानी", en: "Gardening", icon: "🌿", group: "outdoor" },
  { id: "lawnMowing", hi: "लॉन कटाई", en: "Lawn Mowing", icon: "🌱", group: "outdoor" },
  { id: "treeCutting", hi: "पेड़ कटाई", en: "Tree Cutting", icon: "🌳", group: "outdoor" },
  { id: "borewellRepair", hi: "बोरवेल रिपेयर", en: "Borewell Repair", icon: "🕳️", group: "outdoor" },

  // Other
  { id: "packersMovers", hi: "पैकर्स & मूवर्स", en: "Packers & Movers", icon: "📦", group: "other" },
];

// Get category by ID
export const getCategoryById = (id: string): CategoryInfo | undefined => {
  return allCategories.find(cat => cat.id === id);
};

// Get category name by ID and language
export const getCategoryName = (id: string, language: "hi" | "en"): string => {
  const cat = getCategoryById(id);
  return cat ? (language === "hi" ? cat.hi : cat.en) : id;
};

// Get category icon by ID
export const getCategoryIcon = (id: string): string => {
  return getCategoryById(id)?.icon || "👤";
};

// Get categories grouped
export const getCategoriesByGroup = () => {
  const groups: Record<string, CategoryInfo[]> = {};
  allCategories.forEach(cat => {
    if (!groups[cat.group]) groups[cat.group] = [];
    groups[cat.group].push(cat);
  });
  return groups;
};
