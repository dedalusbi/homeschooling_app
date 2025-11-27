import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, IonAvatar, IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonChip, IonContent, IonHeader, IonIcon, IonLabel, IonSpinner, IonTitle, IonToolbar, LoadingController, NavController } from '@ionic/angular/standalone';
import { catchError, EMPTY, Observable } from 'rxjs';
import { StudentService } from '../student.service';
import { ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';
import { add, calendar, camera, checkmark, close, create, createOutline, person, trash } from 'ionicons/icons';
import { Student } from 'src/app/models/student.model';
import { Auth } from 'src/app/auth/auth';

@Component({
  selector: 'app-student-details',
  templateUrl: './student-details.page.html',
  styleUrls: ['./student-details.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons,
    IonBackButton, IonButton, IonIcon, IonLabel, IonSpinner, IonCard, IonCardContent,
    IonChip, IonAvatar
  ]
})
export class StudentDetailsPage implements OnInit {

  student$: Observable<{data: Student} | null> = EMPTY; 
  studentId: string | null = null;
  currentUserId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private studentService: StudentService,
    private navCtrl: NavController,
    private location: Location,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private authService: Auth
  ) {
    addIcons({
      'camera': camera,
      'person': person,
      'calendar': calendar,
      'add': add,
      'checkmark': checkmark,
      'create': create,
      'create-outline': createOutline,
      'trash': trash,
      'close': close
    });
    this.currentUserId = this.authService.currentUserId;
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


  async confirmDeleteStudent(studentId: string | undefined, studentName: string | undefined) {

    if (!studentId || !studentName) return;

    const alert = await this.alertCtrl.create({
      header: 'Confirmar Remoção',
      message: `Tem a certeza que deseja remover permanentemente o perfil de "${studentName}"? Todos os dados associados (planejamentos, registros) serão perdidos.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Remover',
          cssClass: 'danger',
          handler: () => {
            this.deleteStudent(studentId);
          }
        }
      ]
    });
    await alert.present();

  }


  async deleteStudent(studentId: string) {

    const loading = await this.loadingCtrl.create({message: 'Removendo aluno...'});
    await loading.present();


    this.studentService.deleteStudent(studentId).subscribe({
      next: async() => {
        await loading.dismiss();
        await this.presentAlert('Aluno removido com sucesso.', 'Mantemos uma cópia de segurança por 60 dias. Para resgatar as informações, contate nosso suporte dentro desse prazo.');
        this.navCtrl.navigateRoot('/tabs/alunos', {animated: true, animationDirection: 'back'});
      },
      error: async(err) => {
        await loading.dismiss();
        console.error('Erro ao remover aluno:',err);
        let errorMessage = 'Não foi possível remover o aluno.';
        if (err.status === 404) {
          errorMessage = 'Aluno não encontrado. Pode já ter sido removido.';
        }
        await this.presentAlert('Erro', errorMessage);
      }
    });

  }


  async presentAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({ header, message, buttons: ['OK'] });
    await alert.present();
  }




}
