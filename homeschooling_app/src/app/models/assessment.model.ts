import { AssessmentAttachment } from "./assessment-attachment.model";

export interface Assessment {
    id: string;
    subject_id: string;
    title: string;
    assessment_date: string;
    grade: string;
    notes?: string;
    attachments?: AssessmentAttachment[];
}