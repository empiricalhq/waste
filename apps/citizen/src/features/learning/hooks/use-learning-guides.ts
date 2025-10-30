import { useQuery } from "@tanstack/react-query";
import { learningService } from "../services/learning-service";

export const useLearningGuides = () => {
  return useQuery({
    queryKey: ["learningGuides"],
    queryFn: learningService.getLearningGuides,
  });
};
