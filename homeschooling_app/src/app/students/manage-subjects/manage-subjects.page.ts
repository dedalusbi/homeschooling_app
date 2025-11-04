import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, NavController } from '@ionic/angular/standalone';
import { Subject } from 'src/app/models/subject.model';
import { StudentService } from '../student.service';
import { ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';
import { add, body, book, calculator, chevronForward, create, filter, flask, folderOpen, musicalNotes, text } from 'ionicons/icons';

@Component({
  selector: 'app-manage-subjects',
  templateUrl: './manage-subjects.page.html',
  styleUrls: ['./manage-subjects.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ManageSubjectsPage implements OnInit {

  studentId: string | null = null;
  selectedStudentId: string | null = null;
  currentStatus: 'active' | 'completed' = 'active';
  subjects: Subject[] = [];
  isLoading = true;



  constructor(
    private studentService: StudentService,
    private navCtrl: NavController,
    private route: ActivatedRoute
  ) {

    addIcons({
      'chevron-forward': chevronForward,
      'folder-open': folderOpen,
      'add': add,
      'book': book,
      'flask': flask,
      'musical-notes': musicalNotes,
      'text': text,
      'calculator': calculator,
      'body': body,
      'create': create,
      'filter': filter
    });

  }

  ngOnInit() {
    this.studentId = this.route.snapshot.paramMap.get('student_id');
    this.selectedStudentId = this.studentId;
  }

  ionViewWillEnter() {
    if (this.studentId) {
      this.loadSubjects();
    } else {
      console.error("Nenhum ID de aluno fornecido na rota");
      this.isLoading=false;
    }
  }  

  segmentChange(event: any) {
    this.currentStatus = event.detail.value;
    this.loadSubjects();
  }

  onStudentChange() {
    if (this.selectedStudentId) {
      this.studentId = this.selectedStudentId;
      this.loadSubjects();
    }
  }

  loadSubjects() {
    if (!this.studentId) return;

    this.isLoading=true;
    this.subjects=[];

    this.studentService.getSubjects(this.studentId, this.currentStatus).subscribe({
      next: (response) => {
        this.subjects = response.data || [];
        this.isLoading=false;
      },
      error: (err) => {
        console.error('Erro ao carregar matérias:', err);
        this.isLoading=false;
      }
    });
  }

  goToAddSubject() {
    if (!this.studentId) return;
    this.navCtrl.navigateForward(`/subject-form/${this.studentId}`);
  }

  goToSubjectDetails(subjectId: string) {
    if (!subjectId) return;
    this.navCtrl.navigateForward(`/subject-details/${subjectId}`);
  }

  getIconForSubject(name: string): string {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('matemática')) return 'calculator';
    if (lowerName.includes('história')) return 'book';
    if (lowerName.includes('ciências')) return 'flask';
    if (lowerName.includes('português')) return 'text';
    if (lowerName.includes('música')) return 'musical-notes';
    if (lowerName.includes('física')) return 'body';
    return 'book';
  }


}
