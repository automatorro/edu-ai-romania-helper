
export interface GenerateMaterialRequest {
  materialType: 'quiz' | 'plan_lectie' | 'prezentare' | 'analogie' | 'evaluare';
  subject: string;
  gradeLevel: string;
  difficulty: string;
  additionalInfo?: string;
  testMode?: boolean;
}

export interface UserProfile {
  role: 'admin' | 'user';
  materials_count: number;
  materials_limit: number;
}
