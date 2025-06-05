
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface GenerateMaterialRequest {
  materialType: 'quiz' | 'plan_lectie' | 'prezentare' | 'analogie' | 'evaluare';
  subject: string;
  gradeLevel: string;
  difficulty: string;
  additionalInfo?: string;
}

export const useGenerateMaterial = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (request: GenerateMaterialRequest) => {
      // Validate request parameters
      if (!request.materialType || !request.subject || !request.gradeLevel || !request.difficulty) {
        throw new Error('Toate câmpurile obligatorii trebuie completate');
      }

      const validTypes = ['quiz', 'plan_lectie', 'prezentare', 'analogie', 'evaluare'];
      if (!validTypes.includes(request.materialType)) {
        throw new Error('Tipul de material nu este valid');
      }

      // Pentru testing - dacă nu există user, simulăm generarea locală
      if (!user) {
        console.log('🎯 Generating demo material without authentication');
        
        // Simulăm o întârziere de API
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Returnăm un răspuns simulat
        return {
          success: true,
          message: "Material demo generat cu succes! (fără autentificare)",
          data: {
            id: 'demo-' + Date.now(),
            type: request.materialType,
            subject: request.subject,
            difficulty: request.difficulty,
            content: generateDemoContent(request),
            created_at: new Date().toISOString()
          }
        };
      }

      // Dacă există user, procedura normală
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Sesiunea a expirat. Te rugăm să te autentifici din nou.');
      }

      // Check rate limits for non-admin users
      if (user.role !== 'admin' && user.materialsCount >= user.materialsLimit) {
        throw new Error('Ai atins limita de materiale generate. Upgrade la premium pentru mai multe materiale.');
      }

      // Call the edge function with proper error handling
      const response = await supabase.functions.invoke('generate-material', {
        body: request,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        console.error('Edge function error:', response.error);
        throw new Error(response.error.message || 'Eroare la generarea materialului');
      }

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Eroare necunoscută la generarea materialului');
      }

      return response.data;
    },
    onSuccess: (data) => {
      const message = data.message || (user?.role === 'admin' 
        ? "Material generat cu succes! (Admin - generări nelimitate)" 
        : user 
          ? "Material generat cu succes!"
          : "Material demo generat cu succes! Creează un cont pentru a salva materialele.");
      
      toast({
        title: "Succes!",
        description: message,
      });
      
      // Invalidate and refetch queries doar dacă avem user
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['materials'] });
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      }
    },
    onError: (error: Error) => {
      console.error('Generate material error:', error);
      toast({
        title: "Eroare",
        description: error.message || 'A apărut o eroare la generarea materialului',
        variant: "destructive",
      });
    },
  });
};

// Funcție pentru generarea de conținut demo
function generateDemoContent(request: GenerateMaterialRequest) {
  const { materialType, subject, difficulty } = request;
  
  switch (materialType) {
    case 'quiz':
      return {
        title: `Quiz Demo: ${subject} - Nivel ${difficulty}`,
        questions: [
          {
            question: `Întrebare demo pentru ${subject}?`,
            options: ['Opțiunea A', 'Opțiunea B', 'Opțiunea C', 'Opțiunea D'],
            correct: 0,
            explanation: 'Aceasta este o explicație demo pentru material generat fără autentificare.'
          },
          {
            question: `Încă o întrebare demo pentru ${subject}?`,
            options: ['Prima variantă', 'A doua variantă', 'A treia variantă', 'A patra variantă'],
            correct: 1,
            explanation: 'Material demo - creează un cont pentru materiale complete generate cu AI.'
          }
        ]
      };
    
    case 'plan_lectie':
      return {
        title: `Plan de lecție demo: ${subject}`,
        duration: '50 minute',
        objectives: [
          `Demo: Elevii vor înțelege conceptele de bază din ${subject}`,
          `Demo: Elevii vor putea aplica cunoștințele în situații practice`
        ],
        activities: [
          { name: 'Introducere Demo', duration: '10 min', description: 'Prezentarea subiectului (versiune demo)' },
          { name: 'Dezvoltare Demo', duration: '25 min', description: 'Explicarea conceptelor (material demo)' },
          { name: 'Încheiere Demo', duration: '15 min', description: 'Recapitulare (versiune demo)' }
        ]
      };
    
    case 'prezentare':
      return {
        title: `Prezentare demo: ${subject}`,
        slides: [
          { title: `Introducere în ${subject} (Demo)`, content: 'Slide demo pentru testare' },
          { title: 'Concepte principale (Demo)', content: 'Conținut demo generat local' },
          { title: 'Concluzii (Demo)', content: 'Material demo - creează cont pentru versiunea completă' }
        ]
      };
    
    case 'analogie':
      return {
        title: `Analogii demo pentru ${subject}`,
        analogies: [
          {
            concept: `Concept demo din ${subject}`,
            analogy: 'Analogie demo pentru testare funcționalitate',
            explanation: 'Explicație demo - material generat fără autentificare'
          }
        ]
      };
    
    case 'evaluare':
      return {
        title: `Evaluare demo: ${subject}`,
        questions: [
          {
            question: `Întrebare demo de evaluare pentru ${subject}`,
            type: 'descriptive',
            points: 10
          }
        ]
      };
    
    default:
      return { message: 'Material demo generat cu succes!' };
  }
}
