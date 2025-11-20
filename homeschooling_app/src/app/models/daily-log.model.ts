export interface DailyLog {
    id?: string;
    schedule_entry_id: string;
    log_date: string;
    status: 'completed' | 'missed';
    notes?: string;
    //photos?: string[]; //Futuramente para as fotos
    inserted_at?: string;
}