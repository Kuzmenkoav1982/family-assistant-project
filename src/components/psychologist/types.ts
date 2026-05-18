export interface ConsultationRecord {
  id: string;
  topic: string;
  question: string;
  answer: string;
  date: string;
}

export interface ExerciseRecord {
  exerciseId: string;
  completedDate: string;
}

export interface RelaxationRecord {
  techniqueId: string;
  completedDate: string;
}

export interface RelaxationTechnique {
  id: string;
  title: string;
  icon: string;
  duration: string;
  difficulty: string;
  description: string;
  steps: string[];
}

export interface FamilyExercise {
  id: string;
  title: string;
  icon: string;
  duration: string;
  description: string;
  benefits: string[];
  steps: string[];
  frequency: string;
}

export interface PsychTest {
  id: string;
  title: string;
  icon: string;
  description: string;
  questions: number;
}

export interface AgeCrisis {
  id: string;
  ageRange: string;
  title: string;
  icon: string;
  color: string;
  what: string;
  signs: string[];
  parentMistakes: string[];
  howToHelp: string[];
  whenToDoctor: string[];
  duration: string;
  keyPhrase: string;
}
