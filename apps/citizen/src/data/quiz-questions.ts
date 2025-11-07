import type { QuizQuestion } from '@/types';

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    item: 'Botella de vidrio',
    question: '¿En qué contenedor va este residuo?',
    imageUrl: 'https://images.unsplash.com/photo-1605994726958-8687a030c634?w=500&q=80',
    options: ['general', 'recycling', 'organic'],
    correctAnswer: 'recycling',
  },
  {
    id: 'q2',
    item: 'Cáscara de plátano',
    question: '¿En qué contenedor va este residuo?',
    imageUrl: 'https://images.unsplash.com/photo-1587132137056-7bf856e08472?w=500&q=80',
    options: ['general', 'recycling', 'organic'],
    correctAnswer: 'organic',
  },
  {
    id: 'q3',
    item: 'Batería usada',
    question: '¿En qué contenedor va este residuo?',
    imageUrl: 'https://images.unsplash.com/photo-1595217918128-6a8455a2a8b3?w=500&q=80',
    options: ['general', 'recycling', 'hazardous'],
    correctAnswer: 'hazardous',
  },
  {
    id: 'q4',
    item: 'Caja de pizza grasienta',
    question: '¿En qué contenedor va este residuo?',
    imageUrl: 'https://images.unsplash.com/photo-1594007654729-4072c4364ddc?w=500&q=80',
    options: ['general', 'recycling', 'organic'],
    correctAnswer: 'general',
  },
];
