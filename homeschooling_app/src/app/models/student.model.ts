
//Defininfo uma interdade para os dados do aluno
export interface Student {
  id?: string;
  name: string;
  birth_date?: string |null; //formato YYYY-MM-DD
  grade_level?: string | null;
  individualities?: any; //jsonb
  avatar_id?: string | null;
  activities_total_today?: number;
  activities_completed_today?: number;

  inserted_at?:string;
  updated_at?:string;

}
