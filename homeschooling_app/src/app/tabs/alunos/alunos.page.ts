import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonCard, IonCardContent, IonContent, IonHeader, IonIcon, IonSpinner, IonTitle, IonToolbar, NavController } from '@ionic/angular/standalone';
import { Student } from 'src/app/models/student.model';
import { addIcons } from 'ionicons';
import { BehaviorSubject } from 'rxjs';
import { add, checkmark, chevronForward, filter, people, school, trendingUp } from 'ionicons/icons';
import { StudentService } from 'src/app/students/student.service';

@Component({
  selector: 'app-alunos',
  templateUrl: './alunos.page.html',
  styleUrls: ['./alunos.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonButton, IonIcon,
    IonCard, IonCardContent, IonSpinner
  ]
})
export class AlunosPage implements OnInit {

  students$ = new BehaviorSubject<Student[] | null>(null);
  isLoading = true;

  constructor(private studentService: StudentService, private navCtrl: NavController) {

    addIcons({
      'filter': filter,
      'checkmark': checkmark,
      'chevron-forward': chevronForward,
      "people": people,
      "add": add,
      "school": school,
      "trending-up": trendingUp
    });

  }

  ngOnInit() {
    
  }

  ionViewWillEnter() {
    this.loadStudents();
  }

  loadStudents() {
    this.isLoading=true;
    this.students$.next(null); //Reseta para null para mostrar loading se já houver dados antigos

    this.studentService.getStudents().subscribe({
      next: (response) => {
        this.students$.next(response.data || []);
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Erro ao carregar alunos:",err);
        this.students$.next([]);
        this.isLoading=false;
      }
    });

  }


  calculateAge(birthDateString?: string | null): string | number {
    if (!birthDateString) {
      return '--';
    }

    try {
      const birthDate = new Date(birthDateString+'T00:00:00');
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m<0 || (m===0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 0 ? age : '--';
    } catch (e) {
      console.error('Erro ao calcular idade', e);
      return '--';
    }

  } 


  goToAddStudent() {
    this.navCtrl.navigateForward('/tabs/alunos/student-form');
  }

  goToStudentDetails(studentId?:string) {
    if (!studentId) return;
    this.navCtrl.navigateForward(`/tabs/alunos/student-details/${studentId}`);
  }

}
