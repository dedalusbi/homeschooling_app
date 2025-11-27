import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonBackButton, IonButtons, IonCard, IonCardContent, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonLabel, IonSegment, IonSegmentButton, IonSelect, IonSelectOption, IonSpinner, IonTitle, IonToolbar, NavController } from '@ionic/angular/standalone';
import { Subject } from 'src/app/models/subject.model';
import { StudentService } from '../student.service';
import { ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';
import { add, body, book, calculator, chevronForward, create, filter, flask, folderOpen, musicalNotes, text } from 'ionicons/icons';
import { Student } from 'src/app/models/student.model';

@Component({
  selector: 'app-manage-subjects',
  templateUrl: './manage-subjects.page.html',
  styleUrls: ['./manage-subjects.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,
    IonButtons, IonBackButton, IonItem, IonSelect, IonSelectOption,
    IonSegment, IonSegmentButton, IonSpinner, IonCard, IonCardContent,
    IonIcon, IonFab, IonFabButton, IonLabel
  ]
})
export class ManageSubjectsPage implements OnInit {

  studentId: string | null = null;
  selectedStudentId: string | null = null;
  currentStatus: 'active' | 'completed' = 'active';
  allSubjects: Subject[] = [];
  filteredSubjects: Subject[]=[];

  activeCount: number = 0;
  completedCount: number =0;

  students: Student[] = [];
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
    this.loadStudentsandSubject();
  }  

  loadStudentsandSubject() {
    this.isLoading=true;

    this.studentService.getStudents().subscribe({
      next: (res) => {
        this.students = res.data || [];
        if (this.students.length > 0) {
          if (!this.studentId) {
            this.studentId = this.students[0].id!;
          }
          this.selectedStudentId = this.studentId;
          this.loadSubjects();
        } else {
          this.isLoading=false;
          this.allSubjects = [];
        }
      },
      error: (err) => {
        console.error('Erro ao carregar lista de alunos:', err);
        this.isLoading=false;
      }
    });

   
  }

  segmentChanged(event: any) {
    this.currentStatus = event.detail.value;
    this.filterSubjects();
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
    
    this.studentService.getSubjects(this.studentId, 'all').subscribe({
      next: (response) => {
        this.allSubjects = response.data || [];
        this.activeCount = this.allSubjects.filter(s => s.status === 'active').length;
        this.completedCount = this.allSubjects.filter(s => s.status === 'completed').length;

        this.filterSubjects();
        this.isLoading=false;
      },
      error: (err) => {
        console.error('Erro ao carregar matérias:', err);
        this.isLoading=false;
      }
    });
  }

  filterSubjects() {
    this.filteredSubjects = this.allSubjects.filter(s => s.status === this.currentStatus);
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
