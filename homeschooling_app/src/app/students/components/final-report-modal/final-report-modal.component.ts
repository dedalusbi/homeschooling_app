import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonIcon, IonLabel, IonTextarea, IonTitle, IonToolbar, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { body, book, calculator, checkmarkCircle, close, flask, musicalNotes, text } from 'ionicons/icons';
import { Subject } from 'src/app/models/subject.model';

@Component({
  selector: 'app-final-report-modal',
  templateUrl: './final-report-modal.component.html',
  styleUrls: ['./final-report-modal.component.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
    IonContent, IonLabel, IonTextarea, IonFooter, ReactiveFormsModule
  ],
  standalone: true,
})
export class FinalReportModalComponent  implements OnInit {

  @Input() subject!: Subject;
  iconName = 'book';
  reportForm: FormGroup;

  get f() {return this.reportForm.controls;}

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder
  ) {
    addIcons({
      'close' : close,
      'checkmark-circle' : checkmarkCircle,
      'book' : book,
      'flask' : flask,
      'musical-notes' : musicalNotes,
      'text' : text,
      'calculator' : calculator,
      'body' : body,
    });

    this.reportForm = this.fb.group({
      final_report: ['', [Validators.required, Validators.minLength(100)]]
    });
  }



  ngOnInit() {

    this.iconName = this.getIconForSubject(this.subject.name);
    this.subject = {...this.subject, progresso: 100};

  }

  dismissModal(data: any = null) {
    this.modalCtrl.dismiss(data, 'cancel');
  }

  submitReport() {
    if (this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      return;
    }
    this.modalCtrl.dismiss(this.reportForm.value, 'confirm');

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
     return 'book';
  }

}
