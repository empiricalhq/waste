import { WasteType } from "@/constants/wasteTypes";

export type Truck = {
  id: string;
  type: WasteType;
  latitude: number;
  longitude: number;
  eta: number;
  route: string;
  status: "active" | "idle" | "completed";
};

export const MOCK_TRUCKS: Truck[] = [
  {
    id: "truck-1",
    type: "recycling",
    latitude: 37.78825,
    longitude: -122.4324,
    eta: 15,
    route: "Route A",
    status: "active",
  },
  {
    id: "truck-2",
    type: "organic",
    latitude: 37.79025,
    longitude: -122.4344,
    eta: 25,
    route: "Route B",
    status: "active",
  },
  {
    id: "truck-3",
    type: "general",
    latitude: 37.78625,
    longitude: -122.4304,
    eta: 8,
    route: "Route C",
    status: "active",
  },
];
