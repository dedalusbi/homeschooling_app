import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonChip, IonContent, IonHeader, IonIcon, IonLabel, IonSpinner, IonTitle, IonToolbar, NavController } from '@ionic/angular/standalone';
import { catchError, EMPTY, Observable } from 'rxjs';
import { StudentService } from '../student.service';
import { ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';
import { add, calendar, camera, checkmark, create, createOutline, person } from 'ionicons/icons';
import { Student } from 'src/app/models/student.model';

@Component({
  selector: 'app-student-details',
  templateUrl: './student-details.page.html',
  styleUrls: ['./student-details.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons,
    IonBackButton, IonButton, IonIcon, IonLabel, IonSpinner, IonCard, IonCardContent,
    IonChip
  ]
})
export class StudentDetailsPage implements OnInit {

  student$: Observable<{data: Student} | null> = EMPTY; 
  studentId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private studentService: StudentService,
    private navCtrl: NavController,
    private location: Location
  ) {
    addIcons({
      'camera': camera,
      'person': person,
      'calendar': calendar,
      'add': add,
      'checkmark': checkmark,
      'create': create,
      'create-outline': createOutline
    });
  }

  ngOnInit() {
    //Pega o ID da rota de forma reativa (melhor que snapshot se a rota puder reutilizar o componente)
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      if (id) {
        this.studentId = id;
        this.loadStudent(id);
        console.log(this.student$);
      } else {
        console.error("ID do aluno não encontrado na rota");
        this.navCtrl.navigateBack('/tabs/alunos');
      }
    });
  }

  loadStudent(id: string) {
    this.student$ = this.studentService.getStudentById(id).pipe(
      catchError(error => {
        console.error('erro ao carregar detalhes do aluno: ', error);
        this.navCtrl.navigateBack('/tabs/alunos');
        return EMPTY;
      })
    );

  }

  saveChanges() {
    //Placeholder para implementação futura
    console.log('Salvar alterações...')
    
  }

  inviteGuardian() {
    //Placeholder para implementação futura
    console.log('Abrir modal de convite...')

  }

  changeStudentPhoto(studentId: string | undefined | null) {
    //Placeholder para implementação futura
    console.log('Alterar foto para aluno')

  }

  goToEditStudent() {
    if (!this.studentId) return;
    this.navCtrl.navigateForward(`/tabs/alunos/student-form/${this.studentId}`);
  }

}
