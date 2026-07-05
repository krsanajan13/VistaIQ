/**
 * Rivermouth Business Directory
 * 30 businesses across 3 districts (Old Town, Harbor, Artisan Quarter)
 * ~30% are flagged as is_underserved: true (mainly in Artisan Quarter)
 */
const businesses = [
  // --- ARTISAN QUARTER (Hidden Gems / Underserved) ---
  {
    id: 1,
    name: "The Clay & Kiln Studio",
    category: "Local Crafts",
    district: "Artisan Quarter",
    lat: 43.6512,
    lon: -70.2501,
    is_underserved: true,
    price_range: "$$",
    hours: "10:00 - 18:00",
    description: "A cooperative pottery workshop featuring hand-thrown ceramics, mugs, and vases made from local Rivermouth clay. Offers daily public workshops."
  },
  {
    id: 2,
    name: "Weavers of Rivermouth",
    category: "Local Crafts",
    district: "Artisan Quarter",
    lat: 43.6520,
    lon: -70.2490,
    is_underserved: true,
    price_range: "$$$",
    hours: "11:00 - 17:00",
    description: "Traditional textile studio preserving historical hand-weaving techniques. Hand-spun wool scarves, blankets, and rugs created on heritage looms."
  },
  {
    id: 3,
    name: "Artisan Books & Prints",
    category: "Art & Culture",
    district: "Artisan Quarter",
    lat: 43.6505,
    lon: -70.2512,
    is_underserved: true,
    price_range: "$",
    hours: "09:00 - 20:00",
    description: "Independent bookstore specializing in local authors, handmade zines, letterpress art prints, and poetry readings in a cozy, hidden courtyard."
  },
  {
    id: 4,
    name: "The Indigo Dye House",
    category: "Local Crafts",
    district: "Artisan Quarter",
    lat: 43.6515,
    lon: -70.2485,
    is_underserved: true,
    price_range: "$$",
    hours: "10:00 - 17:30",
    description: "An open studio showcasing natural plant-based indigo dyeing. Buy custom dyed apparel or bring your own clothes for a community vat dye session."
  },
  {
    id: 5,
    name: "Paper & Bind Guild",
    category: "Local Crafts",
    district: "Artisan Quarter",
    lat: 43.6498,
    lon: -70.2505,
    is_underserved: true,
    price_range: "$$",
    hours: "10:00 - 18:00",
    description: "Preserving the craft of manual bookbinding. Features marbled paper sheets, leather-bound journals, and custom binding restoration workshops."
  },
  {
    id: 6,
    name: "Quarter Note Jazz Cellar",
    category: "Nightlife",
    district: "Artisan Quarter",
    lat: 43.6508,
    lon: -70.2498,
    is_underserved: true,
    price_range: "$$",
    hours: "20:00 - 02:00",
    description: "A subterranean intimate jazz venue spotlighting regional musicians and experimental composers. Serves craft organic cider and local wines."
  },
  {
    id: 7,
    name: "The Foundry Metalworks",
    category: "Local Crafts",
    district: "Artisan Quarter",
    lat: 43.6525,
    lon: -70.2518,
    is_underserved: true,
    price_range: "$$$",
    hours: "09:00 - 17:00",
    description: "Blacksmithing shop selling hand-forged home hardware, cooking utensils, and metal sculptures. Visitors can watch the live hot-forge forge works."
  },
  {
    id: 8,
    name: "Loom & Leaf Cafe",
    category: "Food & Drink",
    district: "Artisan Quarter",
    lat: 43.6501,
    lon: -70.2492,
    is_underserved: true,
    price_range: "$",
    hours: "08:00 - 16:00",
    description: "A plant-filled vegetarian cafe situated inside a shared textile collective. Serving single-origin coffees, herbal teas, and locally baked pastries."
  },

  // --- ARTISAN QUARTER (Standard/Not Underserved) ---
  {
    id: 9,
    name: "Artisan Quarter Gallery",
    category: "Art & Culture",
    district: "Artisan Quarter",
    lat: 43.6530,
    lon: -70.2500,
    is_underserved: false,
    price_range: "$$$",
    hours: "10:00 - 19:00",
    description: "Spacious modern gallery displaying contemporary paintings, sculptures, and glassworks by regional and national artists."
  },
  {
    id: 10,
    name: "The Foundry Brewery",
    category: "Food & Drink",
    district: "Artisan Quarter",
    lat: 43.6535,
    lon: -70.2520,
    is_underserved: false,
    price_range: "$$",
    hours: "12:00 - 23:00",
    description: "Industrial-chic taproom serving award-winning craft beers brewed on-site. Popular evening spot with a spacious beer garden."
  },

  // --- OLD TOWN (Hotspots / High Traffic) ---
  {
    id: 11,
    name: "Old Town Clocktower Cafe",
    category: "Food & Drink",
    district: "Old Town",
    lat: 43.6582,
    lon: -70.2561,
    is_underserved: false,
    price_range: "$$",
    hours: "07:00 - 20:00",
    description: "Bustling coffee shop directly opposite the historic clocktower. Famous for its cinnamon rolls, espresso drinks, and tourist-friendly outdoor seating."
  },
  {
    id: 12,
    name: "The Rivermouth Museum",
    category: "History & Heritage",
    district: "Old Town",
    lat: 43.6590,
    lon: -70.2550,
    is_underserved: false,
    price_range: "$$",
    hours: "09:30 - 17:00",
    description: "The town's central historical museum detailing Rivermouth's maritime background, colonial history, and early shipping artifacts."
  },
  {
    id: 13,
    name: "Heritage Sweet Shop",
    category: "Food & Drink",
    district: "Old Town",
    lat: 43.6575,
    lon: -70.2568,
    is_underserved: false,
    price_range: "$",
    hours: "10:00 - 21:00",
    description: "Old-fashioned candy store offering handmade fudge, saltwater taffy, and traditional hard candies using recipes unchanged since 1912."
  },
  {
    id: 14,
    name: "Old Town Tavern",
    category: "Nightlife",
    district: "Old Town",
    lat: 43.6580,
    lon: -70.2575,
    is_underserved: false,
    price_range: "$$",
    hours: "16:00 - 01:00",
    description: "Historic tavern featuring dark wood booths, local drafts on tap, pub food, and live acoustic music on weekends. Very popular with tours."
  },
  {
    id: 15,
    name: "Main Street Souvenirs",
    category: "Local Crafts",
    district: "Old Town",
    lat: 43.6588,
    lon: -70.2558,
    is_underserved: false,
    price_range: "$",
    hours: "09:00 - 20:00",
    description: "Large gift shop offering post cards, magnets, apparel, and mass-market local crafts. High foot traffic location in the pedestrian zone."
  },
  {
    id: 16,
    name: "St. Jude Historic Church",
    category: "History & Heritage",
    district: "Old Town",
    lat: 43.6570,
    lon: -70.2545,
    is_underserved: false,
    price_range: "Free",
    hours: "08:00 - 16:30",
    description: "Stunning 18th-century stone church featuring stained glass windows, historic graveyard, and a quiet garden open to the public."
  },
  {
    id: 17,
    name: "The Gilded Rose Boutique",
    category: "Art & Culture",
    district: "Old Town",
    lat: 43.6595,
    lon: -70.2565,
    is_underserved: false,
    price_range: "$$$",
    hours: "10:00 - 19:00",
    description: "High-end boutique showcasing fine jewelry, designer clothing, and luxury home decor in a beautifully restored Victorian building."
  },
  {
    id: 18,
    name: "Belfry Pizza & Pasta",
    category: "Food & Drink",
    district: "Old Town",
    lat: 43.6578,
    lon: -70.2552,
    is_underserved: false,
    price_range: "$$",
    hours: "11:30 - 22:00",
    description: "Family-friendly Italian restaurant specializing in brick-oven pizzas, fresh pasta, and house wines, with a large tourist crowd."
  },
  {
    id: 19,
    name: "Cobblestone Leather Co.",
    category: "Local Crafts",
    district: "Old Town",
    lat: 43.6585,
    lon: -70.2570,
    is_underserved: false,
    price_range: "$$$",
    hours: "10:00 - 18:00",
    description: "A well-known leather goods store selling belts, bags, wallets, and jackets. Highly visible location on the main walking tour route."
  },
  {
    id: 20,
    name: "Rivermouth Walking Tours",
    category: "History & Heritage",
    district: "Old Town",
    lat: 43.6580,
    lon: -70.2560,
    is_underserved: false,
    price_range: "$$",
    hours: "09:00 - 17:00",
    description: "Guided tours through Rivermouth's oldest lanes. Highlights include ghost tours, historical walks, and architectural history guides."
  },

  // --- HARBOR DISTRICT (Seasonal / Outdoors / Dining) ---
  {
    id: 21,
    name: "Harbor Seafood Grille",
    category: "Food & Drink",
    district: "Harbor",
    lat: 43.6620,
    lon: -70.2450,
    is_underserved: false,
    price_range: "$$$",
    hours: "11:30 - 22:00",
    description: "Waterfront dining with panoramic views of the bay. Specializes in fresh lobster rolls, oysters, and locally caught fish."
  },
  {
    id: 22,
    name: "Rivermouth Harbor Cruises",
    category: "Nature & Outdoors",
    district: "Harbor",
    lat: 43.6630,
    lon: -70.2435,
    is_underserved: false,
    price_range: "$$$",
    hours: "08:30 - 19:00",
    description: "Daily boat excursions offering whale watching, sunset sails, and historical cruises around the bay and outer islands."
  },
  {
    id: 23,
    name: "The Salty Dog Pub",
    category: "Nightlife",
    district: "Harbor",
    lat: 43.6615,
    lon: -70.2460,
    is_underserved: false,
    price_range: "$$",
    hours: "12:00 - 01:00",
    description: "Classic harbor pub frequented by fishermen and tourists alike. Waterfront deck, strong drinks, and famous fish and chips."
  },
  {
    id: 24,
    name: "Harbor Bicycle Rentals",
    category: "Nature & Outdoors",
    district: "Harbor",
    lat: 43.6608,
    lon: -70.2448,
    is_underserved: false,
    price_range: "$$",
    hours: "08:00 - 18:00",
    description: "Rent cruisers, hybrids, and electric bikes to explore the scenic coastal pathway leading from the harbor to the outer lighthouse."
  },
  {
    id: 25,
    name: "Sea Shell & Glass Shop",
    category: "Local Crafts",
    district: "Harbor",
    lat: 43.6612,
    lon: -70.2455,
    is_underserved: false,
    price_range: "$",
    hours: "09:00 - 18:00",
    description: "Gift store specializing in wind chimes, local sea glass jewelry, mounted shells, and ocean-themed home accessories."
  },
  {
    id: 26,
    name: "Buoy Coffee Hut",
    category: "Food & Drink",
    district: "Harbor",
    lat: 43.6625,
    lon: -70.2440,
    is_underserved: false,
    price_range: "$",
    hours: "06:00 - 16:00",
    description: "Walk-up coffee counter located directly on the pier. Catering to early morning fishermen and boardwalk strolls."
  },
  {
    id: 27,
    name: "Lighthouse Keeper's Museum",
    category: "History & Heritage",
    district: "Harbor",
    lat: 43.6650,
    lon: -70.2380,
    is_underserved: false,
    price_range: "$",
    hours: "10:00 - 16:00",
    description: "Small museum situated inside a functioning 19th-century lighthouse. Climb the spiral stairs for expansive coastal views."
  },
  {
    id: 28,
    name: "Bayview Kayaks & SUPs",
    category: "Nature & Outdoors",
    district: "Harbor",
    lat: 43.6605,
    lon: -70.2465,
    is_underserved: true, // Underserved kayak launch
    price_range: "$$",
    hours: "09:00 - 17:00",
    description: "A small, local kayak and stand-up paddleboard rental kiosk located at the quiet end of the public beach. Guided eco-tours of the salt marshes."
  },
  {
    id: 29,
    name: "Fish Market Cooperative",
    category: "Food & Drink",
    district: "Harbor",
    lat: 43.6622,
    lon: -70.2430,
    is_underserved: true, // Underserved local market coop
    price_range: "$",
    hours: "08:00 - 15:00",
    description: "A seafood cooperative owned and operated by local fishermen. Buy fresh catch of the day or try their simple crab cakes at the rear counter."
  },
  {
    id: 30,
    name: "The Surfside Shack",
    category: "Nightlife",
    district: "Harbor",
    lat: 43.6598,
    lon: -70.2472,
    is_underserved: false,
    price_range: "$$",
    hours: "17:00 - 24:00",
    description: "Casual open-air beach bar featuring tropical cocktails, fire pits, and reggae music right on the sand. Open seasonally."
  }
];

module.exports = businesses;
