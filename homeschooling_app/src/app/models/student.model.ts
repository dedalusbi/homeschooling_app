
//Defininfo uma interdade para os dados do aluno
export interface Student {
  id?: string;
  name: string;
  birth_date?: string |null; //formato YYYY-MM-DD
  grade_level?: string | null;
  individualities?: any; //jsonb

}
