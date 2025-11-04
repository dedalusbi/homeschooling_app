export interface Subject {

    id: string;
    student_id: string;
    name: string;
    description: string | null;
    status: 'active' | 'completed';
    aulas_concluidas?: number;
    aulas_totais?: number;
    progresso?:number;


}
