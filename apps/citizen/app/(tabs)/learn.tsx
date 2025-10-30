import Colors from "@/constants/colors";
import { WASTE_TYPES } from "@/constants/wasteTypes";
import { getLearningGuides, getQuizQuestions, getUser, updateUserProgress } from "@/services/api";
import { LearningGuide, QuizQuestion, User, WasteType } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Trophy, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type QuizState = {
  active: boolean;
  currentQuestion: number;
  selectedAnswer: WasteType | null;
  showResult: boolean;
  isCorrect: boolean;
};

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ["user"],
    queryFn: getUser,
  });

  const { data: learningGuides = [], isLoading: isLoadingGuides } = useQuery<LearningGuide[]>({
    queryKey: ["learningGuides"],
    queryFn: getLearningGuides,
  });

  const { data: quizQuestions = [], isLoading: isLoadingQuiz } = useQuery<QuizQuestion[]>({
    queryKey: ["quizQuestions"],
    queryFn: getQuizQuestions,
  });

  const { mutate: updateUser } = useMutation({
    mutationFn: updateUserProgress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);
  const [quizState, setQuizState] = useState<QuizState>({
    active: false,
    currentQuestion: 0,
    selectedAnswer: null,
    showResult: false,
    isCorrect: false,
  });

  const startQuiz = () => {
    setQuizState({
      active: true,
      currentQuestion: 0,
      selectedAnswer: null,
      showResult: false,
      isCorrect: false,
    });
  };

  const handleAnswer = (answer: WasteType) => {
    if (!user) return;
    const currentQ = quizQuestions[quizState.currentQuestion];
    const isCorrect = answer === currentQ.correctAnswer;

    setQuizState({ ...quizState, selectedAnswer: answer, showResult: true, isCorrect });

    updateUser({
      ...user.progress,
      correctAnswers: user.progress.correctAnswers + (isCorrect ? 1 : 0),
      totalQuestions: user.progress.totalQuestions + 1,
    });
  };

  const nextQuestion = () => {
    if (quizState.currentQuestion < quizQuestions.length - 1) {
      setQuizState({
        ...quizState,
        currentQuestion: quizState.currentQuestion + 1,
        selectedAnswer: null,
        showResult: false,
      });
    } else {
      // Logic for quiz completion and streak update
      if (user) {
        const today = new Date().toISOString().split("T")[0];
        const lastQuizDate = user.progress.lastQuizDate;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        let newStreak = user.progress.streak;
        if (lastQuizDate === yesterdayStr) {
          newStreak += 1;
        } else if (lastQuizDate !== today) {
          newStreak = 1;
        }

        updateUser({
          ...user.progress,
          streak: newStreak,
          lastQuizDate: today,
        });
      }

      setQuizState({ ...quizState, active: false, currentQuestion: 0 });
    }
  };

  const accuracy =
    user && user.progress.totalQuestions > 0
      ? Math.round((user.progress.correctAnswers / user.progress.totalQuestions) * 100)
      : 0;

  const isLoading = isLoadingUser || isLoadingGuides || isLoadingQuiz;

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={Colors.light.text} />
      </View>
    );
  }

  if (selectedGuide) {
    const guide = learningGuides.find((g) => g.id === selectedGuide);
    if (!guide) return null;

    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={() => setSelectedGuide(null)}>
            <Text style={styles.backButton}>← Atrás</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Image source={{ uri: guide.imageUrl }} style={styles.detailImage} resizeMode="cover" />
          <View style={styles.detailContent}>
            <View style={styles.detailTitleRow}>
              <Text style={styles.detailTitle}>{guide.name}</Text>
              <View
                style={[styles.detailBadge, { backgroundColor: WASTE_TYPES[guide.category].color }]}
              />
            </View>
            <Text style={styles.detailCategory}>{WASTE_TYPES[guide.category].label}</Text>
            <Text style={styles.detailDescription}>{guide.description}</Text>
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Ejemplos</Text>
              {guide.examples.map((example, idx) => (
                <View key={idx} style={styles.detailExample}>
                  <View style={styles.detailExampleDot} />
                  <Text style={styles.detailExampleText}>{example}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Aprender</Text>
        <TouchableOpacity style={styles.quizButton} onPress={startQuiz} activeOpacity={0.7}>
          <Trophy size={18} color={Colors.light.cardBackground} />
          <Text style={styles.quizButtonText}>Test</Text>
        </TouchableOpacity>
      </View>

      {quizState.active ? (
        <ScrollView style={styles.quizActive} showsVerticalScrollIndicator={false}>
          <View style={styles.quizHeader}>
            <TouchableOpacity onPress={() => setQuizState({ ...quizState, active: false })}>
              <Text style={styles.backButton}>← Volver</Text>
            </TouchableOpacity>
            <View style={styles.quizStats}>
              <Text style={styles.quizStatText}>{user?.progress.streak} días de racha</Text>
              <View style={styles.statDivider} />
              <Text style={styles.quizStatText}>{accuracy}% precisión</Text>
            </View>
          </View>
          <View style={styles.quizProgress}>
            <Text style={styles.quizProgressText}>
              Pregunta {quizState.currentQuestion + 1} de {quizQuestions.length}
            </Text>
          </View>
          <Image
            source={{ uri: quizQuestions[quizState.currentQuestion].imageUrl }}
            style={styles.quizImage}
            resizeMode="cover"
          />
          <Text style={styles.quizQuestion}>
            {quizQuestions[quizState.currentQuestion].question}
          </Text>
          <Text style={styles.quizItem}>{quizQuestions[quizState.currentQuestion].item}</Text>
          <View style={styles.options}>
            {quizQuestions[quizState.currentQuestion].options.map((option) => {
              const isSelected = quizState.selectedAnswer === option;
              const isCorrect = option === quizQuestions[quizState.currentQuestion].correctAnswer;
              const showCorrect = quizState.showResult && isCorrect;
              const showWrong = quizState.showResult && isSelected && !isCorrect;

              return (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    showCorrect && styles.optionCorrect,
                    showWrong && styles.optionWrong,
                  ]}
                  onPress={() => !quizState.showResult && handleAnswer(option)}
                  disabled={quizState.showResult}>
                  <Text
                    style={[
                      styles.optionText,
                      (showCorrect || showWrong) && styles.optionTextActive,
                    ]}>
                    {WASTE_TYPES[option].label}
                  </Text>
                  {showCorrect && <Check size={18} color="#FFFFFF" />}
                  {showWrong && <X size={18} color="#FFFFFF" />}
                </TouchableOpacity>
              );
            })}
          </View>
          {quizState.showResult && (
            <TouchableOpacity style={styles.nextButton} onPress={nextQuestion}>
              <Text style={styles.nextButtonText}>
                {quizState.currentQuestion < quizQuestions.length - 1
                  ? "Siguiente pregunta"
                  : "Finalizar test"}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.roadmapSection}>
            <Text style={styles.roadmapTitle}>Tu ruta de aprendizaje</Text>
            <View style={styles.roadmap}>
              {learningGuides.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.roadmapItem}
                  onPress={() => setSelectedGuide(item.id)}
                  activeOpacity={0.7}>
                  <View style={styles.roadmapLeft}>
                    <View
                      style={[
                        styles.roadmapDot,
                        { backgroundColor: WASTE_TYPES[item.category].color },
                      ]}
                    />
                    {index < learningGuides.length - 1 && <View style={styles.roadmapLine} />}
                  </View>
                  <View style={styles.roadmapCard}>
                    <Text style={styles.roadmapItemTitle}>{item.name}</Text>
                    <Text style={styles.roadmapItemCategory}>
                      {WASTE_TYPES[item.category].label}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
  quizButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.light.text,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  quizButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.light.cardBackground,
  },
  statDivider: {
    width: 1,
    height: 14,
    backgroundColor: Colors.light.border,
  },
  backButton: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  roadmapSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  roadmapTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.light.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 20,
  },
  roadmap: {},
  roadmapItem: {
    flexDirection: "row",
    gap: 16,
  },
  roadmapLeft: {
    alignItems: "center",
    width: 20,
  },
  roadmapDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
  },
  roadmapLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.light.border,
    marginVertical: 4,
  },
  roadmapCard: {
    flex: 1,
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  roadmapItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.text,
    marginBottom: 4,
  },
  roadmapItemCategory: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  detailHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  detailImage: {
    width: "100%",
    height: 280,
  },
  detailContent: {
    padding: 20,
  },
  detailTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.light.text,
    flex: 1,
    letterSpacing: -0.5,
  },
  detailBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
  },
  detailCategory: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    marginBottom: 16,
  },
  detailDescription: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
    marginBottom: 24,
  },
  detailSection: {
    gap: 12,
  },
  detailSectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.light.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailExample: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailExampleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.text,
  },
  detailExampleText: {
    fontSize: 15,
    color: Colors.light.text,
  },
  quizHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  quizStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
  },
  quizStatText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  quizActive: {
    flex: 1,
    paddingBottom: 20,
  },
  quizProgress: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quizProgressText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.textSecondary,
  },
  quizImage: {
    width: "100%",
    height: 240,
    marginBottom: 20,
  },
  quizQuestion: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.light.textSecondary,
    marginBottom: 4,
    paddingHorizontal: 20,
  },
  quizItem: {
    fontSize: 22,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 20,
    letterSpacing: -0.5,
    paddingHorizontal: 20,
  },
  options: {
    gap: 8,
    paddingHorizontal: 20,
  },
  optionButton: {
    backgroundColor: Colors.light.cardBackground,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  optionCorrect: {
    backgroundColor: Colors.light.text,
    borderColor: Colors.light.text,
  },
  optionWrong: {
    backgroundColor: Colors.light.textSecondary,
    borderColor: Colors.light.textSecondary,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.text,
  },
  optionTextActive: {
    color: Colors.light.cardBackground,
  },
  nextButton: {
    backgroundColor: Colors.light.text,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    marginHorizontal: 20,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.cardBackground,
  },
});
