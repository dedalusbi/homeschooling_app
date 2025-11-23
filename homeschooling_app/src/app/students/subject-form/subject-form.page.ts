import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
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
  isLoading=false;

  get f() {return this.subjectForm.controls;}

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private route: ActivatedRoute,
    private location: Location
  ) {
    addIcons({
      'save': save
    });
    this.subjectForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [null],
      status: ['active', Validators.required],
      teaching_materials: ['']
    });
  }

  ngOnInit() {
    this.subjectId = this.route.snapshot.paramMap.get('id');

    if (this.subjectId) {
      //MODO EDIÇÃO
      this.pageTitle='Editar Matéria';
      this.loadSubjectData(this.subjectId);
    } else {
      // MODO CRIAÇÃO
      this.pageTitle = 'Adicionar Matéria';
      this.studentId = this.route.snapshot.paramMap.get('student_id');
      if (!this.studentId) {
        console.error("ID do aluno não fornecido para criar matéria.");
        this.presentAlert('Erro', 'Não foi possível identificar o aluno. Volte e tente novamente.');
        this.navCtrl.navigateBack('/tabs/alunos');
      }
    }

    
  }

  async onSubmit() {

    if (this.subjectForm.invalid) {
      this.subjectForm.markAllAsTouched();
      return;
    }

    const loading = await this.loadingCtrl.create({message: 'Salvando...'});
    await loading.present();
    const formData = this.subjectForm.value;

    //Verifica se estamos salvando ou criando...
    if (this.subjectId) {
      //Modo EDIÇÃO
      this.studentService.updateSubject(this.subjectId, formData).subscribe({
        next: async (res) => {
        await loading.dismiss();
        await this.presentAlert('Sucesso', 'Matéria atualizada!');
        this.navCtrl.back();
      },
      error: async (err) => {
        await loading.dismiss();
        let errorMessage='Não foi possível atualizar a matéria.';
        if (err.error?.errors) {
          errorMessage = Object.values(err.error.errors).flat().join(' ');
        }
        await this.presentAlert('Erro', errorMessage);
      }
      });
    } else if (this.studentId) {
        //MODO CRIAÇÃO
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
    } else {
      await loading.dismiss();
      await this.presentAlert('Erro Grave', 'ID do aluno ou da matéria não definido');
    }

    
  }

  async loadSubjectData(id: string) {
    this.isLoading=true;
    const loading = await this.loadingCtrl.create({message: 'Carregando dados...'});
    await loading.present();

    this.studentService.getSubjectById(id).subscribe({
      next: async (res) => {
        const subjectData = res.data;
        this.subjectForm.patchValue({
          name: subjectData.name,
          description: subjectData.description,
          status: subjectData.status,
          teaching_materials: subjectData.teaching_materials
        });
        this.studentId = subjectData.student_id;
        this.isLoading = false;
        await loading.dismiss();
      },
      error: async (err) => {
        console.error("Erro ao carregar matéria:",err);
        this.isLoading=false;
        await loading.dismiss();
        await this.presentAlert('Erro', 'Não foi possível carregar os dados da matéria');
        this.navCtrl.back();
      }
    });
  }


  async presentAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({header, message, buttons: ['OK']});
    await alert.present();

  }
}
