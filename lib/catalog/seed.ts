// Curator-seeded catalog. Used to seed the database (Phase 1) and as the local
// fallback when Supabase is not configured, so the app runs end-to-end in dev.
// Real-world dimensions (mm) are curator-tagged.
//
// Two flavours of entry:
//  • GLB-backed (the first six): Khronos sample models (CORS-enabled
//    raw.githubusercontent.com) standing in for R2-hosted assets.
//  • Primitive-backed (everyday objects): no GLB; rendered as a calibrated
//    box/cylinder/sphere/cone at true dimensions — the point of a scale bench.
import type { ModelMetadata } from "@/lib/schema/model";

const KHRONOS =
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models";
const THREEJS =
  "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf";

// Convenience builders for the GLB URLs of the two CORS-enabled asset repos.
const khronos = (name: string) =>
  `${KHRONOS}/${name}/glTF-Binary/${name}.glb`;
const threejs = (file: string) => `${THREEJS}/${file}`;

type EverydayShape = "box" | "cylinder" | "sphere" | "cone";

// Builder for a GLB-backed everyday object. Dimensions are [W, H, D] mm; the GLB
// is uniform-scaled to fit (proportions preserved), so dims are the declared
// real-world size. IDs are deterministic UUIDs (matches migration 0004).
function glbItem(
  n: number,
  name: string,
  slug: string,
  [widthMm, heightMm, depthMm]: [number, number, number],
  glbUrl: string,
  tags: string[],
): ModelMetadata {
  return {
    id: `c0000000-0000-4000-8000-${String(n).padStart(12, "0")}`,
    name,
    slug,
    widthMm,
    heightMm,
    depthMm,
    source: "catalog",
    glbUrl,
    tags,
    visibility: "public",
  };
}

// Compact constructor for the no-GLB everyday objects. Dimensions are [W, H, D] mm,
// where H is the vertical (Y) extent. IDs are deterministic UUIDs so re-seeding is
// idempotent (matches supabase/migrations/0004_everyday_catalog.sql).
function everyday(
  n: number,
  name: string,
  slug: string,
  [widthMm, heightMm, depthMm]: [number, number, number],
  shape: EverydayShape,
  tags: string[],
): ModelMetadata {
  return {
    id: `c0000000-0000-4000-8000-${String(n).padStart(12, "0")}`,
    name,
    slug,
    widthMm,
    heightMm,
    depthMm,
    source: "catalog",
    shape,
    tags,
    visibility: "public",
  };
}

export const SEED_CATALOG: ModelMetadata[] = [
  // ---- GLB-backed sample models ----
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Water Bottle",
    slug: "water-bottle",
    widthMm: 74,
    heightMm: 230,
    depthMm: 74,
    source: "catalog",
    glbUrl: `${KHRONOS}/WaterBottle/glTF-Binary/WaterBottle.glb`,
    tags: ["bottle", "drink", "kitchen"],
    visibility: "public",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Avocado",
    slug: "avocado",
    widthMm: 70,
    heightMm: 100,
    depthMm: 70,
    source: "catalog",
    glbUrl: `${KHRONOS}/Avocado/glTF-Binary/Avocado.glb`,
    tags: ["food", "fruit", "kitchen"],
    visibility: "public",
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    name: "Rubber Duck",
    slug: "rubber-duck",
    widthMm: 85,
    heightMm: 100,
    depthMm: 85,
    source: "catalog",
    glbUrl: `${KHRONOS}/Duck/glTF-Binary/Duck.glb`,
    tags: ["toy", "duck", "bath"],
    visibility: "public",
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    name: "Boom Box",
    slug: "boom-box",
    widthMm: 400,
    heightMm: 250,
    depthMm: 130,
    source: "catalog",
    glbUrl: `${KHRONOS}/BoomBox/glTF-Binary/BoomBox.glb`,
    tags: ["electronics", "speaker", "stereo"],
    visibility: "public",
  },
  {
    id: "55555555-5555-4555-8555-555555555555",
    name: "Street Lantern",
    slug: "street-lantern",
    widthMm: 320,
    heightMm: 1900,
    depthMm: 320,
    source: "catalog",
    glbUrl: `${KHRONOS}/Lantern/glTF-Binary/Lantern.glb`,
    tags: ["outdoor", "light", "lamp"],
    visibility: "public",
  },
  {
    id: "66666666-6666-4666-8666-666666666666",
    name: "Damaged Helmet",
    slug: "damaged-helmet",
    widthMm: 280,
    heightMm: 300,
    depthMm: 300,
    source: "catalog",
    glbUrl: `${KHRONOS}/DamagedHelmet/glTF-Binary/DamagedHelmet.glb`,
    tags: ["gear", "helmet", "sci-fi"],
    visibility: "public",
  },

  // ---- Furniture ----
  glbItem(1, "Dining Chair", "dining-chair", [460, 900, 520], khronos("ChairDamaskPurplegold"), ["chair", "furniture", "seat"]),
  glbItem(2, "Office Chair", "office-chair", [660, 1150, 660], khronos("SheenChair"), ["chair", "office", "furniture"]),
  everyday(3, "Bar Stool", "bar-stool", [400, 750, 400], "cylinder", ["stool", "seat", "furniture"]),
  everyday(4, "Dining Table", "dining-table", [1600, 750, 900], "box", ["table", "furniture", "dining"]),
  everyday(5, "Coffee Table", "coffee-table", [1100, 450, 600], "box", ["table", "furniture", "living"]),
  everyday(6, "Office Desk", "office-desk", [1400, 740, 700], "box", ["desk", "office", "table"]),
  glbItem(7, "Sofa (3-seat)", "sofa-3-seat", [2100, 850, 950], khronos("GlamVelvetSofa"), ["sofa", "couch", "furniture"]),
  everyday(8, "Bookshelf", "bookshelf", [800, 1800, 300], "box", ["shelf", "furniture", "storage"]),
  everyday(9, "Queen Bed", "queen-bed", [1530, 600, 2030], "box", ["bed", "furniture", "bedroom"]),
  everyday(10, "Nightstand", "nightstand", [450, 550, 400], "box", ["furniture", "bedroom", "table"]),
  everyday(11, "Wardrobe", "wardrobe", [1000, 2000, 600], "box", ["wardrobe", "furniture", "storage"]),
  everyday(12, "Floor Lamp", "floor-lamp", [350, 1600, 350], "cylinder", ["lamp", "light", "furniture"]),

  // ---- Electronics / appliances ----
  everyday(13, "24\" Monitor", "monitor-24", [555, 410, 190], "box", ["monitor", "screen", "computer"]),
  everyday(14, "27\" Monitor", "monitor-27", [625, 450, 200], "box", ["monitor", "screen", "computer"]),
  everyday(15, "Laptop (15\")", "laptop-15", [350, 20, 245], "box", ["laptop", "computer", "electronics"]),
  everyday(16, "Desktop Tower", "desktop-tower", [200, 450, 450], "box", ["pc", "computer", "electronics"]),
  everyday(17, "55\" Television", "tv-55", [1240, 780, 260], "box", ["tv", "television", "screen"]),
  everyday(18, "Smartphone", "smartphone", [72, 147, 8], "box", ["phone", "smartphone", "mobile"]),
  everyday(19, "Tablet", "tablet", [180, 250, 7], "box", ["tablet", "ipad", "electronics"]),
  everyday(20, "Keyboard", "keyboard", [440, 35, 135], "box", ["keyboard", "computer", "peripheral"]),
  everyday(21, "Microwave Oven", "microwave-oven", [500, 300, 400], "box", ["microwave", "kitchen", "appliance"]),
  glbItem(22, "Refrigerator", "refrigerator", [700, 1750, 700], khronos("CommercialRefrigerator"), ["fridge", "kitchen", "appliance"]),
  everyday(23, "Washing Machine", "washing-machine", [600, 850, 600], "box", ["washer", "laundry", "appliance"]),

  // ---- Vehicles ----
  glbItem(24, "Bicycle", "bicycle", [1750, 1050, 600], threejs("CarbonFrameBike.glb"), ["bike", "bicycle", "vehicle"]),
  everyday(25, "Motorcycle", "motorcycle", [2150, 1150, 800], "box", ["motorcycle", "motorbike", "vehicle"]),
  glbItem(26, "Sedan Car", "sedan-car", [4700, 1450, 1820], khronos("CarConcept"), ["car", "sedan", "vehicle"]),
  everyday(27, "SUV", "suv", [4850, 1720, 1920], "box", ["car", "suv", "vehicle"]),
  everyday(28, "City Bus", "city-bus", [12000, 3200, 2550], "box", ["bus", "vehicle", "transit"]),
  everyday(29, "Kick Scooter", "kick-scooter", [1000, 1050, 160], "box", ["scooter", "vehicle"]),

  // ---- Wearables / everyday small items ----
  glbItem(30, "Wristwatch", "wristwatch", [45, 45, 14], khronos("ChronographWatch"), ["watch", "wristwatch", "accessory"]),
  glbItem(31, "Coffee Mug", "coffee-mug", [120, 95, 95], threejs("coffeeMug.glb"), ["mug", "cup", "kitchen"]),
  everyday(32, "Soda Can", "soda-can", [66, 123, 66], "cylinder", ["can", "drink", "beverage"]),
  everyday(33, "Wine Bottle", "wine-bottle", [75, 300, 75], "cylinder", ["bottle", "wine", "drink"]),
  everyday(34, "Basketball", "basketball", [240, 240, 240], "sphere", ["ball", "basketball", "sports"]),
  everyday(35, "Soccer Ball", "soccer-ball", [220, 220, 220], "sphere", ["ball", "soccer", "sports"]),
  everyday(36, "Dinner Plate", "dinner-plate", [270, 25, 270], "cylinder", ["plate", "kitchen", "dish"]),
  everyday(37, "Hardcover Book", "hardcover-book", [160, 240, 40], "box", ["book", "reading"]),
  everyday(38, "Backpack", "backpack", [320, 460, 200], "box", ["backpack", "bag"]),
  everyday(39, "Interior Door", "interior-door", [900, 2030, 40], "box", ["door", "home"]),
  everyday(40, "Traffic Cone", "traffic-cone", [300, 750, 300], "cone", ["cone", "traffic", "outdoor"]),
];
