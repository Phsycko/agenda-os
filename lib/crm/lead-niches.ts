/**
 * Catálogo de nichos / giros para leads — agrupado por vertical.
 * IDs estables en snake_case UPPER; etiquetas tal como en negocio (EN con contexto).
 */

export type LeadNicheItem = { readonly id: string; readonly label: string };
export type LeadNicheGroup = { readonly id: string; readonly title: string; readonly items: readonly LeadNicheItem[] };

export const LEAD_NICHE_GROUPS = [
  {
    id: "CONSTRUCTION_RESIDENTIAL",
    title: "\u{1F3D7} Construcción y vivienda",
    items: [
      { id: "GENERAL_CONTRACTORS", label: "General contractors" },
      { id: "CUSTOM_HOME_BUILDERS", label: "Custom home builders" },
      { id: "SPEC_HOME_BUILDERS", label: "Spec home builders" },
      { id: "REMODELING_CONTRACTORS", label: "Remodeling contractors" },
      { id: "KITCHEN_REMODELING", label: "Kitchen remodeling" },
      { id: "BATHROOM_REMODELING", label: "Bathroom remodeling" },
      { id: "HOME_RENOVATION", label: "Home renovation" },
      { id: "HOME_ADDITIONS", label: "Home additions" },
      { id: "ADU_BUILDERS", label: "ADU builders (Accessory Dwelling Units)" },
      { id: "FRAMING_WOOD_STEEL", label: "Framing (wood/steel)" },
      { id: "DRYWALL_INSTALLATION", label: "Drywall installation" },
      { id: "DRYWALL_FINISHING_TAPING", label: "Drywall finishing / taping" },
      { id: "STUCCO_CONTRACTORS", label: "Stucco contractors" },
      { id: "PLASTERING_GENERAL", label: "Plastering (general)" },
      { id: "PAINTING_INTERIOR", label: "Painting interior" },
      { id: "PAINTING_EXTERIOR", label: "Painting exterior" },
      { id: "COMMERCIAL_PAINTING", label: "Commercial painting" },
      { id: "INDUSTRIAL_PAINTING", label: "Industrial painting" },
      { id: "EPOXY_COATINGS", label: "Epoxy coatings" },
      { id: "FLOORING_INSTALLATION", label: "Flooring installation" },
      { id: "TILE_INSTALLATION", label: "Tile installation" },
      { id: "HARDWOOD_FLOORING", label: "Hardwood flooring" },
      { id: "VINYL_LAMINATE_FLOORING", label: "Vinyl / laminate flooring" },
      { id: "CARPET_INSTALLATION", label: "Carpet installation" },
      { id: "CONCRETE_CONTRACTORS", label: "Concrete contractors" },
      { id: "CONCRETE_SLABS", label: "Concrete slabs" },
      { id: "DRIVEWAYS", label: "Driveways" },
      { id: "SIDEWALKS", label: "Sidewalks" },
      { id: "STAMPED_CONCRETE", label: "Stamped concrete" },
      { id: "FOUNDATIONS", label: "Foundations" },
      { id: "MASONRY_BRICK_BLOCK_STONE", label: "Masonry (brick/block/stone)" },
      { id: "RETAINING_WALLS", label: "Retaining walls" },
      { id: "PAVERS_INSTALLATION", label: "Pavers installation" },
      { id: "ASPHALT_PAVING", label: "Asphalt paving" },
      { id: "SEALCOATING", label: "Sealcoating" },
      { id: "DEMOLITION_CONTRACTORS", label: "Demolition contractors" },
      { id: "EXCAVATION", label: "Excavation" },
      { id: "GRADING_LAND_LEVELING", label: "Grading / land leveling" },
      { id: "LAND_CLEARING", label: "Land clearing" },
      { id: "TRENCHING", label: "Trenching" },
      { id: "REBAR_INSTALLATION", label: "Rebar installation" },
      { id: "FORMWORK_CONCRETE_FORMING", label: "Formwork / concrete forming" },
      { id: "STEEL_STRUCTURE_INSTALLATION", label: "Steel structure installation" },
      { id: "WELDING_FABRICATION", label: "Welding / fabrication" },
      { id: "SCAFFOLDING_SERVICES", label: "Scaffolding services" },
    ],
  },
  {
    id: "TECHNICAL_INSTALLS",
    title: "\u{1F527} Instalaciones técnicas (alto valor)",
    items: [
      { id: "PLUMBING", label: "Plumbing" },
      { id: "EMERGENCY_PLUMBING", label: "Emergency plumbing" },
      { id: "DRAIN_CLEANING", label: "Drain cleaning" },
      { id: "SEWER_LINE_REPAIR", label: "Sewer line repair" },
      { id: "WATER_HEATER_INSTALLATION", label: "Water heater installation" },
      { id: "TANKLESS_WATER_HEATERS", label: "Tankless water heaters" },
      { id: "ELECTRICAL_CONTRACTORS", label: "Electrical contractors" },
      { id: "RESIDENTIAL_ELECTRICIANS", label: "Residential electricians" },
      { id: "COMMERCIAL_ELECTRICIANS", label: "Commercial electricians" },
      { id: "PANEL_UPGRADES", label: "Panel upgrades" },
      { id: "EV_CHARGER_INSTALLATION", label: "EV charger installation" },
      { id: "HVAC_INSTALLATION", label: "HVAC installation" },
      { id: "HVAC_REPAIR", label: "HVAC repair" },
      { id: "AIR_CONDITIONING_SERVICE", label: "Air conditioning service" },
      { id: "HEATING_SYSTEMS", label: "Heating systems" },
      { id: "DUCT_INSTALLATION_CLEANING", label: "Duct installation / cleaning" },
      { id: "SOLAR_PANEL_INSTALLATION", label: "Solar panel installation" },
      { id: "SOLAR_MAINTENANCE", label: "Solar maintenance" },
      { id: "BATTERY_SYSTEMS_HOME", label: "Battery systems (Tesla, etc.)" },
      { id: "LOW_VOLTAGE_SYSTEMS", label: "Low voltage systems" },
      { id: "SMART_HOME_INSTALLATION", label: "Smart home installation" },
      { id: "HOME_AUTOMATION", label: "Home automation" },
      { id: "SECURITY_SYSTEMS_CCTV", label: "Security systems (CCTV)" },
      { id: "ALARM_SYSTEMS", label: "Alarm systems" },
      { id: "FIRE_SPRINKLER_SYSTEMS", label: "Fire sprinkler systems" },
      { id: "ACCESS_CONTROL_SYSTEMS", label: "Access control systems" },
    ],
  },
  {
    id: "POOLS_EXTERIOR",
    title: "\u{1F3CA} Albercas y exterior premium",
    items: [
      { id: "POOL_BUILDERS", label: "Pool builders" },
      { id: "CUSTOM_POOLS", label: "Custom pools" },
      { id: "POOL_REMODELING", label: "Pool remodeling" },
      { id: "POOL_PLASTERING", label: "Pool plastering" },
      { id: "POOL_TILE", label: "Pool tile" },
      { id: "POOL_COPING", label: "Pool coping" },
      { id: "POOL_CLEANING_MAINTENANCE", label: "Pool cleaning / maintenance" },
      { id: "POOL_EQUIPMENT_INSTALLATION", label: "Pool equipment installation" },
      { id: "POOL_LEAK_DETECTION", label: "Pool leak detection" },
      { id: "SPA_JACUZZI_INSTALLATION", label: "Spa / jacuzzi installation" },
      { id: "SAUNAS", label: "Saunas" },
      { id: "OUTDOOR_KITCHENS", label: "Outdoor kitchens" },
      { id: "BBQ_ISLANDS", label: "BBQ islands" },
      { id: "PERGOLAS", label: "Pergolas" },
      { id: "PATIO_COVERS", label: "Patio covers" },
      { id: "DECK_BUILDERS", label: "Deck builders (wood/composite)" },
      { id: "FENCING_CONTRACTORS", label: "Fencing contractors" },
      { id: "GATES_AUTOMATIC_GATES", label: "Gates / automatic gates" },
      { id: "ARTIFICIAL_GRASS", label: "Artificial grass" },
      { id: "LANDSCAPING", label: "Landscaping" },
      { id: "LANDSCAPE_DESIGN", label: "Landscape design" },
      { id: "HARDSCAPE", label: "Hardscape" },
      { id: "IRRIGATION_SYSTEMS", label: "Irrigation systems" },
      { id: "SPRINKLER_SYSTEMS", label: "Sprinkler systems" },
      { id: "TREE_REMOVAL", label: "Tree removal" },
      { id: "TREE_TRIMMING", label: "Tree trimming" },
      { id: "STUMP_GRINDING", label: "Stump grinding" },
      { id: "GARDEN_MAINTENANCE", label: "Garden maintenance" },
    ],
  },
  {
    id: "HEAVY_SITE",
    title: "\u{1F69B} Servicios pesados / obra gruesa",
    items: [
      { id: "JUNK_REMOVAL", label: "Junk removal" },
      { id: "TRASH_HAULING", label: "Trash hauling" },
      { id: "DUMPSTER_RENTAL", label: "Dumpster rental" },
      { id: "MATERIAL_HAULING", label: "Material hauling" },
      { id: "EQUIPMENT_RENTAL", label: "Equipment rental" },
      { id: "HEAVY_MACHINERY_OPERATORS", label: "Heavy machinery operators" },
      { id: "SKID_STEER_SERVICES", label: "Skid steer services" },
      { id: "BOBCAT_SERVICES", label: "Bobcat services" },
      { id: "CRANE_SERVICES", label: "Crane services" },
      { id: "CONCRETE_CUTTING", label: "Concrete cutting" },
      { id: "CORE_DRILLING", label: "Core drilling" },
      { id: "COMPACTION_SERVICES", label: "Compaction services" },
      { id: "ROAD_WORK_CONTRACTORS", label: "Road work contractors" },
    ],
  },
  {
    id: "PROPERTY_HOME",
    title: "\u{1F3E0} Servicios para casas / propiedades",
    items: [
      { id: "PROPERTY_MANAGEMENT", label: "Property management" },
      { id: "HOA_SERVICES", label: "HOA services" },
      { id: "AIRBNB_MANAGEMENT", label: "Airbnb management" },
      { id: "SHORT_TERM_RENTAL_CLEANING", label: "Short-term rental cleaning" },
      { id: "HOUSE_CLEANING", label: "House cleaning" },
      { id: "DEEP_CLEANING", label: "Deep cleaning" },
      { id: "MOVE_IN_MOVE_OUT_CLEANING", label: "Move-in / move-out cleaning" },
      { id: "POST_CONSTRUCTION_CLEANING", label: "Post-construction cleaning" },
      { id: "WINDOW_CLEANING", label: "Window cleaning" },
      { id: "PRESSURE_WASHING", label: "Pressure washing" },
      { id: "POWER_WASHING", label: "Power washing" },
      { id: "GUTTER_CLEANING", label: "Gutter cleaning" },
      { id: "GUTTER_INSTALLATION", label: "Gutter installation" },
      { id: "ROOF_CLEANING", label: "Roof cleaning" },
      { id: "SOLAR_PANEL_CLEANING", label: "Solar panel cleaning" },
    ],
  },
  {
    id: "MAINTENANCE_REPAIRS",
    title: "\u{1F9F0} Mantenimiento y reparaciones",
    items: [
      { id: "HANDYMAN_SERVICES", label: "Handyman services" },
      { id: "HOME_MAINTENANCE", label: "Home maintenance" },
      { id: "APPLIANCE_REPAIR", label: "Appliance repair" },
      { id: "GARAGE_DOOR_INSTALLATION", label: "Garage door installation" },
      { id: "GARAGE_DOOR_REPAIR", label: "Garage door repair" },
      { id: "DOOR_INSTALLATION", label: "Door installation" },
      { id: "WINDOW_REPAIR", label: "Window repair" },
      { id: "GLASS_REPAIR", label: "Glass repair" },
      { id: "LOCKSMITH", label: "Locksmith" },
      { id: "FENCE_REPAIR", label: "Fence repair" },
      { id: "GATE_REPAIR", label: "Gate repair" },
      { id: "DRYWALL_REPAIR", label: "Drywall repair" },
      { id: "STUCCO_REPAIR", label: "Stucco repair" },
      { id: "ROOF_REPAIR", label: "Roof repair" },
      { id: "LEAK_REPAIR", label: "Leak repair" },
    ],
  },
  {
    id: "FINISHES_DETAIL",
    title: "\u{1FAB5} Acabados / detalle (muy rentables)",
    items: [
      { id: "CABINET_INSTALLATION", label: "Cabinet installation" },
      { id: "CABINET_REFINISHING", label: "Cabinet refinishing" },
      { id: "CUSTOM_CABINETS", label: "Custom cabinets" },
      { id: "CLOSET_SYSTEMS", label: "Closet systems" },
      { id: "COUNTERTOPS_GRANITE_QUARTZ", label: "Countertops (granite/quartz/marble)" },
      { id: "BACKSPLASH_INSTALLATION", label: "Backsplash installation" },
      { id: "TILE_SPECIALISTS", label: "Tile specialists" },
      { id: "WALLPAPER_INSTALLATION", label: "Wallpaper installation" },
      { id: "INTERIOR_FINISHES", label: "Interior finishes" },
      { id: "TRIM_MOLDING_CARPENTRY", label: "Trim / molding / carpentry" },
      { id: "FINISH_CARPENTRY", label: "Finish carpentry" },
      { id: "WOODWORKING", label: "Woodworking" },
      { id: "CUSTOM_FURNITURE", label: "Custom furniture" },
      { id: "GLASS_SHOWER_DOORS", label: "Glass shower doors" },
      { id: "MIRRORS_INSTALLATION", label: "Mirrors installation" },
    ],
  },
  {
    id: "COMMERCIAL_INDUSTRIAL",
    title: "\u{1F3E2} Comercial / industrial",
    items: [
      { id: "COMMERCIAL_CONTRACTORS", label: "Commercial contractors" },
      { id: "OFFICE_BUILD_OUTS", label: "Office build-outs" },
      { id: "RETAIL_BUILD_OUTS", label: "Retail build-outs" },
      { id: "RESTAURANT_CONSTRUCTION", label: "Restaurant construction" },
      { id: "WAREHOUSE_CONSTRUCTION", label: "Warehouse construction" },
      { id: "INDUSTRIAL_MAINTENANCE", label: "Industrial maintenance" },
      { id: "FACILITY_MANAGEMENT", label: "Facility management" },
      { id: "JANITORIAL_SERVICES", label: "Janitorial services" },
      { id: "COMMERCIAL_CLEANING", label: "Commercial cleaning" },
      { id: "INDUSTRIAL_CLEANING", label: "Industrial cleaning" },
    ],
  },
  {
    id: "AUTOMOTIVE",
    title: "\u{1F697} Automotriz local",
    items: [
      { id: "AUTO_DETAILING", label: "Auto detailing" },
      { id: "MOBILE_DETAILING", label: "Mobile detailing" },
      { id: "CAR_WASH", label: "Car wash" },
      { id: "WINDOW_TINTING", label: "Window tinting" },
      { id: "WRAP_SERVICES", label: "Wrap services" },
      { id: "BODY_SHOP", label: "Body shop" },
      { id: "MECHANIC_SHOPS", label: "Mechanic shops" },
      { id: "TIRE_SHOPS", label: "Tire shops" },
      { id: "TOWING_SERVICES", label: "Towing services" },
    ],
  },
  {
    id: "COMPLEMENTARY",
    title: "\u{1F9E0} Servicios complementarios",
    items: [
      { id: "REAL_ESTATE_AGENTS", label: "Real estate agents" },
      { id: "MORTGAGE_BROKERS", label: "Mortgage brokers" },
      { id: "INSURANCE_AGENTS", label: "Insurance agents" },
      { id: "INTERIOR_DESIGNERS", label: "Interior designers" },
      { id: "ARCHITECTS", label: "Architects" },
      { id: "ENGINEERS_CIVIL_STRUCTURAL", label: "Engineers (civil/structural)" },
      { id: "OTRO_GIRO", label: "Otro giro (especificar en notas)" },
    ],
  },
] as const satisfies readonly LeadNicheGroup[];

const _labelMap: Record<string, string> = {};
for (const g of LEAD_NICHE_GROUPS) {
  for (const it of g.items) {
    _labelMap[it.id] = it.label;
  }
}

/** Mapa id → etiqueta para búsqueda y UI */
export const LEAD_NICHE_LABELS: Readonly<Record<string, string>> = _labelMap;

/** Todos los IDs válidos (incluye OTRO_GIRO) */
export const ALL_LEAD_NICHE_IDS: readonly string[] = LEAD_NICHE_GROUPS.flatMap((g) => g.items.map((i) => i.id));

const nicheIdSet = new Set(ALL_LEAD_NICHE_IDS);

/** Valores legacy del CRM antes del catálogo extendido */
export const LEGACY_LEAD_SECTOR_TO_NICHE: Readonly<Record<string, string>> = {
  LANDSCAPE: "LANDSCAPING",
  ELECTRICIDAD: "RESIDENTIAL_ELECTRICIANS",
  PLOMERIA: "PLUMBING",
  LIMPIEZA: "HOUSE_CLEANING",
  ROOFING: "ROOF_REPAIR",
  CONSTRUCCION: "GENERAL_CONTRACTORS",
  SOLDADURA: "WELDING_FABRICATION",
  OTRO: "OTRO_GIRO",
};

export function isValidLeadNicheId(id: string | null | undefined): boolean {
  return typeof id === "string" && nicheIdSet.has(id);
}

/** Etiqueta legible; devuelve el id si no está en catálogo (datos custom). */
export function leadNicheLabel(id: string | null | undefined): string {
  if (!id) return "";
  return LEAD_NICHE_LABELS[id] ?? id.replaceAll("_", " ");
}

/** Normaliza valor guardado: catálogo, legado u null */
export function coerceStoredLeadNiche(value: unknown): string | null {
  if (value == null || value === "") return null;
  const s = String(value);
  if (nicheIdSet.has(s)) return s;
  const mapped = LEGACY_LEAD_SECTOR_TO_NICHE[s];
  if (mapped && nicheIdSet.has(mapped)) return mapped;
  return null;
}
