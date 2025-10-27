import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState, useCallback, useMemo } from "react";
import { MOCK_COLLECTIONS, Collection } from "@/mocks/collections";
import { MOCK_REPORTS, Report } from "@/mocks/reports";
import { MOCK_TRUCKS, Truck } from "@/mocks/trucks";

type UserProgress = {
  streak: number;
  lastQuizDate: string | null;
  correctAnswers: number;
  totalQuestions: number;
  badges: string[];
};



const STORAGE_KEYS = {
  REPORTS: "waste-app-reports",
  USER_PROGRESS: "waste-app-progress",
  NOTIFICATIONS: "waste-app-notifications",
};

export const [AppProvider, useApp] = createContextHook(() => {
  const [trucks, setTrucks] = useState<Truck[]>(MOCK_TRUCKS);
  const [collections] = useState<Collection[]>(MOCK_COLLECTIONS);
  const [reports, setReports] = useState<Report[]>(MOCK_REPORTS);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    streak: 0,
    lastQuizDate: null,
    correctAnswers: 0,
    totalQuestions: 0,
    badges: [],
  });

  useEffect(() => {
    loadPersistedData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      simulateTruckMovement();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadPersistedData = async () => {
    try {
      const [storedReports, storedProgress, storedNotifications] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.REPORTS),
        AsyncStorage.getItem(STORAGE_KEYS.USER_PROGRESS),
        AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS),
      ]);

      if (storedReports) {
        setReports(JSON.parse(storedReports));
      }
      if (storedProgress) {
        setUserProgress(JSON.parse(storedProgress));
      }
      if (storedNotifications !== null) {
        setNotificationsEnabled(JSON.parse(storedNotifications));
      }
    } catch (error) {
      console.error("Failed to load persisted data:", error);
    }
  };

  const addReport = useCallback(async (report: Omit<Report, "id" | "createdAt" | "updatedAt" | "status">) => {
    const newReport: Report = {
      ...report,
      id: `rep-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "pending",
    };

    setReports((prev) => {
      const updatedReports = [newReport, ...prev];
      AsyncStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(updatedReports));
      return updatedReports;
    });
  }, []);

  const updateReportStatus = useCallback(async (id: string, status: Report["status"]) => {
    setReports((prev) => {
      const updatedReports = prev.map((r) =>
        r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r
      );
      AsyncStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(updatedReports));
      return updatedReports;
    });
  }, []);

  const updateUserProgress = useCallback(async (progress: Partial<UserProgress>) => {
    setUserProgress((prev) => {
      const updatedProgress = { ...prev, ...progress };
      AsyncStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(updatedProgress));
      return updatedProgress;
    });
  }, []);

  const toggleNotifications = useCallback(async () => {
    setNotificationsEnabled((prev) => {
      const newValue = !prev;
      AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(newValue));
      return newValue;
    });
  }, []);

  const simulateTruckMovement = useCallback(() => {
    setTrucks((prevTrucks) =>
      prevTrucks.map((truck) => ({
        ...truck,
        latitude: truck.latitude + (Math.random() - 0.5) * 0.002,
        longitude: truck.longitude + (Math.random() - 0.5) * 0.002,
        eta: Math.max(1, truck.eta - 1),
      }))
    );
  }, []);

  return useMemo(
    () => ({
      trucks,
      collections,
      reports,
      userProgress,
      notificationsEnabled,
      addReport,
      updateReportStatus,
      updateUserProgress,
      toggleNotifications,
      simulateTruckMovement,
    }),
    [
      trucks,
      collections,
      reports,
      userProgress,
      notificationsEnabled,
      addReport,
      updateReportStatus,
      updateUserProgress,
      toggleNotifications,
      simulateTruckMovement,
    ]
  );
});
