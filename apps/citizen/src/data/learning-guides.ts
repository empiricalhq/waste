import type { LearningGuide } from "@/types";

export const learningGuides: LearningGuide[] = [
  {
    id: "guide-1",
    name: "Clasificación de plásticos",
    category: "recycling",
    imageUrl:
      "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=500&q=80",
    description:
      "Aprende a identificar y separar correctamente los diferentes tipos de plásticos para un reciclaje efectivo.",
    examples: ["Botellas de PET", "Envases de HDPE", "Bolsas de LDPE"],
  },
  {
    id: "guide-2",
    name: "Compostaje en casa",
    category: "organic",
    imageUrl:
      "https://images.unsplash.com/photo-1593113646773-ae18c60a87d7?w=500&q=80",
    description:
      "Descubre cómo convertir tus residuos orgánicos en abono rico en nutrientes para tus plantas.",
    examples: [
      "Restos de frutas y verduras",
      "Cáscaras de huevo",
      "Posos de café",
    ],
  },
  {
    id: "guide-3",
    name: "Manejo de residuos peligrosos",
    category: "hazardous",
    imageUrl:
      "https://images.unsplash.com/photo-1628177207933-286467622830?w=500&q=80",
    description:
      "Identifica los residuos peligrosos comunes en el hogar y aprende cómo desecharlos de manera segura.",
    examples: [
      "Pilas y baterías",
      "Pinturas y solventes",
      "Medicamentos vencidos",
    ],
  },
];
