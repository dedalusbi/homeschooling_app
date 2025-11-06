import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonChip, IonContent, IonFooter, IonHeader, IonIcon, IonItem, IonSpinner, IonTitle, IonToolbar, NavController } from '@ionic/angular/standalone';
import { BehaviorSubject, catchError, EMPTY } from 'rxjs';
import { Subject } from 'src/app/models/subject.model';
import { ActivatedRoute } from '@angular/router';
import { StudentService } from '../student.service';
import { addIcons } from 'ionicons';
import { add, arrowUndo, body, book, calculator, checkmarkDone, chevronForward, create, documentText, flask, musicalNotes, pencil, people, text } from 'ionicons/icons';

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

  constructor(
    private route: ActivatedRoute,
    private studentService: StudentService,
    private navCtrl: NavController
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
  confirmFinishSubject() {console.log('Abrir modal para Finalizar Matéria');}
  reactivateSubject() {console.log('Abrir modal para reativar matéria');}

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
}
