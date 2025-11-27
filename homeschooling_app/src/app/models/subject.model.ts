import { ActivityHistory } from "./activity-history.model";

export interface Subject {

    id: string;
    student_id: string;
    name: string;
    description: string | null;
    status: 'active' | 'completed';
    completion_report?: string | null;
    aulas_concluidas?: number;
    aulas_totais?: number;
    progresso?:number;
    teaching_materials?: string | null;
    history?: ActivityHistory[];
    aulas_realizadas?: number;
    participacao?: number;

}
