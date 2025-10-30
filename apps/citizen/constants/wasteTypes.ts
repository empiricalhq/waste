export type WasteType = "general" | "recycling" | "organic" | "hazardous";

export const WASTE_TYPES: Record<WasteType, { label: string; color: string; icon: string }> = {
  general: {
    label: "Residuos generales",
    color: "#6B7280",
    icon: "trash-2",
  },
  recycling: {
    label: "Reciclaje",
    color: "#3B82F6",
    icon: "recycle",
  },
  organic: {
    label: "Orgánico",
    color: "#10B981",
    icon: "leaf",
  },
  hazardous: {
    label: "Peligroso",
    color: "#EF4444",
    icon: "alert-triangle",
  },
};
