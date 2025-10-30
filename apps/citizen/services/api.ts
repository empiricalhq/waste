import { Report, User, UserProgress, UserSettings } from "@/types";

const API_BASE_URL = "http://192.168.18.218:8000";

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Ocurrió un error en la solicitud.");
  }
  return response.json();
};

// GET
export const getTrucks = () => fetch(`${API_BASE_URL}/trucks`).then(handleResponse);
export const getCollections = () => fetch(`${API_BASE_URL}/collections`).then(handleResponse);
export const getReports = () =>
  fetch(`${API_BASE_URL}/reports?_sort=createdAt&_order=desc`).then(handleResponse);
export const getReportTypes = () => fetch(`${API_BASE_URL}/reportTypes`).then(handleResponse);
export const getLearningGuides = () => fetch(`${API_BASE_URL}/learningGuides`).then(handleResponse);
export const getQuizQuestions = () => fetch(`${API_BASE_URL}/quizQuestions`).then(handleResponse);
export const getUser = (): Promise<User> => fetch(`${API_BASE_URL}/user`).then(handleResponse);

// POST
export const addReport = async (
  reportData: Omit<Report, "id" | "status" | "createdAt" | "updatedAt">
) => {
  const newReport: Omit<Report, "id"> = {
    ...reportData,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const response = await fetch(`${API_BASE_URL}/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newReport),
  });
  return handleResponse(response);
};

// PATCH
export const updateUserProgress = async (progress: Partial<UserProgress>) => {
  const response = await fetch(`${API_BASE_URL}/user`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ progress }),
  });
  return handleResponse(response);
};

export const updateUserSettings = async (settings: Partial<UserSettings>) => {
  const response = await fetch(`${API_BASE_URL}/user`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ settings }),
  });
  return handleResponse(response);
};
