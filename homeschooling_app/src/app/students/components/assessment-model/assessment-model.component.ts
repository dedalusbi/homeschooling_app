import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertController, IonButton, IonButtons, IonContent, IonDatetime, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonModal, IonTextarea, IonTitle, IonToolbar, LoadingController, ModalController } from '@ionic/angular/standalone';
import { Assessment } from 'src/app/models/assessment.model';
import { StudentService } from '../../student.service';
import { addIcons } from 'ionicons';
import { calendar, close, save } from 'ionicons/icons';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-assessment-model',
  templateUrl: './assessment-model.component.html',
  styleUrls: ['./assessment-model.component.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, FormsModule, ReactiveFormsModule,
    IonLabel, IonItem, DatePipe, IonModal, IonTextarea, IonInput, IonDatetime
  ],
  standalone: true,
})
export class AssessmentModelComponent  implements OnInit {

  @Input() subjectId!: string;
  @Input() assessmentToEdit: Assessment | null = null;

  form: FormGroup;
  isEditMode = false;

  get f() {return this.form.controls;}

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private studentService: StudentService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {

    addIcons({
      'close': close,
      'calendar': calendar,
      'save': save
    });

    this.form = this.fb.group({
      title: ['', Validators.required],
      assessment_date: [new Date().toISOString(), Validators.required],
      grade: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit() {
    if (this.assessmentToEdit) {
      this.isEditMode = true;
      this.form.patchValue({
        ...this.assessmentToEdit,
        assessment_date: this.assessmentToEdit.assessment_date
      });
    }
  }

  async onSubmit() {
    if (this.form.invalid) return;

    const loading = await this.loadingCtrl.create();
    await loading.present();

    const formData = this.form.value;
    formData.assessment_date = formData.assessment_date.split('T')[0];

    let obs;
    if (this.isEditMode && this.assessmentToEdit) {
      //editar
    } else {
      obs = this.studentService.createAssessment(this.subjectId, formData);
    }

    obs?.subscribe({
      next: async (res: any) => {
        await loading.dismiss();
        this.dismiss(res.data);
      },
      error: async (err: any) => {
        await loading.dismiss();
        console.error(err);
      }
    });

  }
  
  dismiss(data: any) {
    this.modalCtrl.dismiss(data);
  }

}
