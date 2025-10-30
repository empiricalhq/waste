import { Colors } from "./design-tokens";

export type WasteType = "general" | "recycling" | "organic" | "hazardous";

export const WASTE_TYPES: Record<WasteType, { label: string; color: string }> = {
  general: { label: "Generales", color: Colors.textSecondary },
  recycling: { label: "Reciclaje", color: Colors.info },
  organic: { label: "Orgánico", color: Colors.success },
  hazardous: { label: "Peligroso", color: Colors.error },
};
