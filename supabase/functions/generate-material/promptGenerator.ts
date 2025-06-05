
export function createPrompt(materialType: string, subject: string, gradeLevel: string, difficulty: string, additionalInfo?: string): string {
  const basePrompt = `Generează un ${materialType} pentru disciplina ${subject}, destinat clasei a ${gradeLevel}-a, cu nivelul de dificultate ${difficulty}.`
  
  const additionalContext = additionalInfo ? `\n\nInformații suplimentare: ${additionalInfo}` : ''
  
  const specificInstructions = {
    quiz: 'Creează un quiz cu 10 întrebări cu variante multiple de răspuns (A, B, C, D). Include răspunsurile corecte și explicațiile la sfârșitul quiz-ului. Formatează răspunsul în JSON cu structura: {"title": "...", "questions": [{"question": "...", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "..."}]}',
    plan_lectie: 'Creează un plan de lecție detaliat cu obiective, activități, resurse necesare și evaluare. Structurează-l în secțiuni claire. Formatează răspunsul în JSON cu structura: {"title": "...", "duration": "...", "objectives": [...], "activities": [{"name": "...", "duration": "...", "description": "..."}], "resources": [...], "evaluation": "..."}',
    prezentare: 'Creează o prezentare structurată cu slide-uri, incluzând introducere, dezvoltare și concluzii. Menționează punctele cheie pentru fiecare slide. Formatează răspunsul în JSON cu structura: {"title": "...", "slides": [{"title": "...", "content": "..."}]}',
    analogie: 'Creează analogii creative și ușor de înțeles care să explice conceptele complexe prin comparații cu situații familiare elevilor. Formatează răspunsul în JSON cu structura: {"title": "...", "analogies": [{"concept": "...", "analogy": "...", "explanation": "..."}], "examples": [...]}',
    evaluare: 'Creează o evaluare cu întrebări variate (întrebări scurte, dezvoltare, probleme practice). Include baremul de notare. Formatează răspunsul în JSON cu structura: {"title": "...", "questions": [{"question": "...", "type": "...", "points": 10}], "answers": [...], "gradingRubric": "..."}'
  }

  return `${basePrompt}\n\n${specificInstructions[materialType as keyof typeof specificInstructions] || 'Generează materialul educațional solicitat.'}${additionalContext}\n\nRăspunde în limba română și asigură-te că conținutul este potrivit pentru nivelul specificat. IMPORTANT: Răspunde DOAR cu JSON-ul valid, fără text suplimentar înainte sau după.`
}
