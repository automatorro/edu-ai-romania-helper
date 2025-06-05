
import { GenerateMaterialRequest } from './types.ts';

export function validateRequest(request: GenerateMaterialRequest): void {
  if (!request.materialType || !request.subject || !request.gradeLevel || !request.difficulty) {
    throw new Error('Parametrii obligatorii lipsesc');
  }

  const validTypes = ['quiz', 'plan_lectie', 'prezentare', 'analogie', 'evaluare'];
  if (!validTypes.includes(request.materialType)) {
    throw new Error('Tipul de material nu este valid');
  }
}
