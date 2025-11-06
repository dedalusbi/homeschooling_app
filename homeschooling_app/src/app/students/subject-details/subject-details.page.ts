import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonChip, IonContent, IonFooter, IonHeader, IonIcon, IonItem, IonSpinner, IonTitle, IonToolbar, LoadingController, ModalController, NavController } from '@ionic/angular/standalone';
import { BehaviorSubject, catchError, EMPTY } from 'rxjs';
import { Subject } from 'src/app/models/subject.model';
import { ActivatedRoute } from '@angular/router';
import { StudentService } from '../student.service';
import { addIcons } from 'ionicons';
import { add, arrowUndo, body, book, calculator, checkmarkDone, chevronForward, create, documentText, flask, helpCircle, informationCircle, musicalNotes, pencil, people, text } from 'ionicons/icons';
import { FinalReportModalComponent } from '../components/final-report-modal/final-report-modal.component';

@Component({
  selector: 'app-subject-details',
  templateUrl: './subject-details.page.html',
  styleUrls: ['./subject-details.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons,IonBackButton,
    IonItem, IonButton, IonIcon, IonSpinner, IonCard, IonCardContent,
    IonChip, IonFooter
  ]
})
export class SubjectDetailsPage implements OnInit {

  subject$ = new BehaviorSubject<{data: Subject} | null>(null);
  subjectId: string |null = null;
  studentIdParam: string | null = null;
  currentSubject: Subject | null = null;

  constructor(
    private route: ActivatedRoute,
    private studentService: StudentService,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private loadignCtrl: LoadingController
  ) { 
    addIcons({
      'create': create,
      'book': book,
      'flask': flask,
      'musical-notes': musicalNotes,
      'text': text,
      'calculator': calculator,
      'body': body,
      'checkmark-done': checkmarkDone,
      'arrow-undo': arrowUndo,
      'pencil': pencil,
      'document-text': documentText,
      'people': people,
      'chevron-forward': chevronForward,
      'add': add,
      'help-circle': helpCircle,
      'information-circle': informationCircle
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.subjectId = id;
        this.loadSubject(id);
      } else {
        console.error("Id da matéria não encontrado na rota.");
        this.navCtrl.navigateBack('/tabs/alunos');
      }
    });
  }

  loadSubject(id: string) {
    this.subject$.next(null);
    this.studentService.getSubjectById(id).pipe(
      catchError(error => {
        console.error('Erro ao carregar detalhes da matéria:',error);
        this.navCtrl.navigateBack('/tabs/alunos');
        return EMPTY;
      })
    ).subscribe(response => {
      this.subject$.next(response);
      this.studentIdParam = response.data.student_id;
      this.currentSubject = response.data;
    });
  }


  //Placeholder para futura função de editar
  goToEditSubject() {
    if (!this.subjectId) return;
    this.navCtrl.navigateForward(`/subject-form/edit/${this.subjectId}`);
    console.log("Navegar para editar matéria:", this.subjectId);
  }

  //Placeholders para ações (a implementar)
  goToAddEvaluation() {console.log('Navegar para adicionar avaliação');}
  goToEvaluationDetails(id: string) {console.log('Navegar para detalhes avaliação');}
  

  async confirmFinishSubject() {
    if (!this.currentSubject) return;

    const modal = await this.modalCtrl.create({
      component: FinalReportModalComponent,
      componentProps: {
        subject: this.currentSubject
      },
      breakpoints: [0, 0.85],
      initialBreakpoint: 0.85,
      backdropBreakpoint: 0.5
    });

    await modal.present();

    const {data, role} = await modal.onWillDismiss();

    if (role === 'confirm' && data) {
      this.executeCompletion(data);
    }
  }

  async executeCompletion(reportData: {final_report: string}) {
    if (!this.subjectId) return;
    const loading = await this.loadignCtrl.create({
      message: 'Finalizando matéria...'
    });
    await loading.present();

    this.studentService.completeSubject(this.subjectId,reportData).subscribe({
      next: async (res) => {
        await loading.dismiss();
        await this.presentAlert('Sucesso','Matéria finalizada e arquivada.');
        this.subject$.next({data: res.data});
        this.currentSubject = res.data;
      },
      error: async (err) => {
        await loading.dismiss();
        let errorMessage = "Não foi possível finalizar a matéria.";
        if (err.status === 422 && err.error?.errors?.final_report) {
          errorMessage = err.error.errors.final_report[0];
        } else if (err.status === 409) {
          errorMessage = err.error.error;
        }
        await this.presentAlert('Erro', errorMessage);
      }
    });
  }



  reactivateSubject() {console.log('Abrir modal para reativar matéria');}


  async showDescription(description: string | null | undefined) {
    const messageToShow = (description && description.trim() !== '')
      ? description
      : 'Nenhuma descrição fornecida para esta matéria.';

    const alert = await this.alertCtrl.create({
      header: 'Descrição da matéria',
      message: messageToShow,
      buttons: ['OK']
    });

    await alert.present();
  }


  getIconForSubject(name: string | undefined): string {
     if (!name) return 'book';
     const lowerName = name.toLowerCase();
     if (lowerName.includes('matemática')) return 'calculator';
     if (lowerName.includes('história')) return 'book';
     if (lowerName.includes('ciências')) return 'flask';
     if (lowerName.includes('português')) return 'text';
     if (lowerName.includes('música')) return 'musical-notes';
     if (lowerName.includes('física')) return 'body';
     return 'book'; // Padrão
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message, buttons: ['OK']
    });
    await alert.present();
  }
}
