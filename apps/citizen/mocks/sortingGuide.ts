import { WasteType } from "@/constants/wasteTypes";

export type SortingItem = {
  id: string;
  name: string;
  category: WasteType;
  description: string;
  examples: string[];
  imageUrl: string;
};

export const SORTING_GUIDE: SortingItem[] = [
  {
    id: "item-1",
    name: "Plastic Bottles",
    category: "recycling",
    description: "Clean plastic bottles and containers",
    examples: ["Water bottles", "Soda bottles", "Milk jugs"],
    imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400",
  },
  {
    id: "item-2",
    name: "Paper & Cardboard",
    category: "recycling",
    description: "Clean paper products and cardboard boxes",
    examples: ["Newspapers", "Magazines", "Cardboard boxes"],
    imageUrl: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400",
  },
  {
    id: "item-3",
    name: "Food Scraps",
    category: "organic",
    description: "Fruit and vegetable waste",
    examples: ["Fruit peels", "Vegetable scraps", "Coffee grounds"],
    imageUrl: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=400",
  },
  {
    id: "item-4",
    name: "Garden Waste",
    category: "organic",
    description: "Leaves, grass, and plant trimmings",
    examples: ["Leaves", "Grass clippings", "Small branches"],
    imageUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400",
  },
  {
    id: "item-5",
    name: "Batteries",
    category: "hazardous",
    description: "All types of batteries",
    examples: ["AA/AAA batteries", "Lithium batteries", "Car batteries"],
    imageUrl: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400",
  },
  {
    id: "item-6",
    name: "Electronics",
    category: "hazardous",
    description: "Old electronic devices",
    examples: ["Phones", "Computers", "Cables"],
    imageUrl: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400",
  },
  {
    id: "item-7",
    name: "General Trash",
    category: "general",
    description: "Non-recyclable waste",
    examples: ["Plastic bags", "Styrofoam", "Dirty packaging"],
    imageUrl: "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=400",
  },
  {
    id: "item-8",
    name: "Glass",
    category: "recycling",
    description: "Clean glass bottles and jars",
    examples: ["Wine bottles", "Jam jars", "Glass containers"],
    imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
  },
];

export type QuizQuestion = {
  id: string;
  question: string;
  item: string;
  options: WasteType[];
  correctAnswer: WasteType;
  imageUrl: string;
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q-1",
    question: "Where should this go?",
    item: "Plastic Water Bottle",
    options: ["recycling", "general", "organic", "hazardous"],
    correctAnswer: "recycling",
    imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400",
  },
  {
    id: "q-2",
    question: "Where should this go?",
    item: "Banana Peel",
    options: ["recycling", "general", "organic", "hazardous"],
    correctAnswer: "organic",
    imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400",
  },
  {
    id: "q-3",
    question: "Where should this go?",
    item: "Old Battery",
    options: ["recycling", "general", "organic", "hazardous"],
    correctAnswer: "hazardous",
    imageUrl: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400",
  },
  {
    id: "q-4",
    question: "Where should this go?",
    item: "Pizza Box (Clean)",
    options: ["recycling", "general", "organic", "hazardous"],
    correctAnswer: "recycling",
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
  },
  {
    id: "q-5",
    question: "Where should this go?",
    item: "Plastic Bag",
    options: ["recycling", "general", "organic", "hazardous"],
    correctAnswer: "general",
    imageUrl: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400",
  },
];
