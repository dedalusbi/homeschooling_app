import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertController, IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonLabel, IonTextarea, IonTitle, IonToolbar, LoadingController, NavController } from '@ionic/angular/standalone';
import { save, thumbsUpSharp } from 'ionicons/icons';
import { StudentService } from '../student.service';
import { ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-subject-form',
  templateUrl: './subject-form.page.html',
  styleUrls: ['./subject-form.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonIcon, IonButtons,
    IonBackButton, IonLabel, IonInput, IonTextarea, IonButton, ReactiveFormsModule
  ]
})
export class SubjectFormPage implements OnInit {

  subjectForm: FormGroup;
  pageTitle = 'Adicionar Matéria';
  studentId: string | null = null;
  subjectId: string | null = null;

  get f() {return this.subjectForm.controls;}

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private route: ActivatedRoute
  ) {
    addIcons({
      'save': save
    });
    this.subjectForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [null],
      status: ['active', Validators.required]
    });
  }

  ngOnInit() {
    this.studentId = this.route.snapshot.paramMap.get('student_id');
    //lógica de edição
  }

  async onSubmit() {
    if (!this.studentId) {
      await this.presentAlert('Erro', 'ID do aluno não encontrado. Não é possível salvar.');
      return;
    }

    if (this.subjectForm.invalid) {
      this.subjectForm.markAllAsTouched();
      return;
    }

    const loading = await this.loadingCtrl.create({message: 'Salvando matéria...'});
    await loading.present();

    const formData = this.subjectForm.value;

    //TODO Lógida de edição

    //Lógica de criação
    this.studentService.createSubject(this.studentId, formData).subscribe({
      next: async (res) => {
        await loading.dismiss();
        await this.presentAlert('Sucesso', 'Matéria adicionada com sucesso!');
        this.navCtrl.navigateBack(`/manage-subjects/${this.studentId}`);
      },
      error: async (err) => {
        await loading.dismiss();
        let errorMessage='Não foi possível salvar a matéria.';
        if (err.error?.errors) {
          errorMessage = Object.values(err.error.errors).flat().join(' ');
        }
        await this.presentAlert('Erro', errorMessage);
      }
    });
  }


  async presentAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({header, message, buttons: ['OK']});
    await alert.present();

  }
}
