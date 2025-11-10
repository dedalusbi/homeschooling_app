
export interface ScheduleEntry {
  id: string;
  student_id: string;
  subject_id: string;
  subject_name: string;
  student_name: string;
  assigned_guardian_id: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  responsible_avatar_id: string | null;
  status?: 'Pendente' | 'Concluída';
}
