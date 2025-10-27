import { WasteType } from "@/constants/wasteTypes";

export type Collection = {
  id: string;
  type: WasteType;
  date: string;
  time: string;
  completed: boolean;
};

export const MOCK_COLLECTIONS: Collection[] = [
  {
    id: "col-1",
    type: "recycling",
    date: "2025-10-15",
    time: "08:00",
    completed: false,
  },
  {
    id: "col-2",
    type: "general",
    date: "2025-10-16",
    time: "09:00",
    completed: false,
  },
  {
    id: "col-3",
    type: "organic",
    date: "2025-10-17",
    time: "08:30",
    completed: false,
  },
  {
    id: "col-4",
    type: "recycling",
    date: "2025-10-08",
    time: "08:00",
    completed: true,
  },
  {
    id: "col-5",
    type: "general",
    date: "2025-10-09",
    time: "09:00",
    completed: true,
  },
];
