import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertController, IonButton, IonButtons, IonContent, IonDatetime, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonModal, IonSpinner, IonTextarea, IonTitle, IonToolbar, LoadingController, ModalController } from '@ionic/angular/standalone';
import { Assessment } from 'src/app/models/assessment.model';
import { StudentService } from '../../student.service';
import { addIcons } from 'ionicons';
import { calendar, camera, close, documentText, save, trash } from 'ionicons/icons';
import { CommonModule, DatePipe, SlicePipe } from '@angular/common';

@Component({
  selector: 'app-assessment-model',
  templateUrl: './assessment-model.component.html',
  styleUrls: ['./assessment-model.component.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, FormsModule, ReactiveFormsModule,
    IonLabel, IonItem, DatePipe, IonModal, IonTextarea, IonInput, IonDatetime, IonSpinner, CommonModule,
    SlicePipe
  ],
  standalone: true,
})
export class AssessmentModelComponent  implements OnInit {

  @Input() subjectId!: string;
  @Input() assessmentToEdit: Assessment | null = null;

  form: FormGroup;
  isEditMode = false;

  attachments: any[]=[];
  isUploading = false;

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
      'save': save,
      'camera': camera,
      'document-text': documentText,
      'trash': trash
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
      console.log("onInit -> condição de editar Avaliação - this.isEditMode = " + this.isEditMode);
      this.form.patchValue({
        ...this.assessmentToEdit,
        assessment_date: this.assessmentToEdit.assessment_date
      });

      //Carrega anexos existentes (se vierem no objeto assessmentToEdit)
      if (this.assessmentToEdit.attachments) {
        this.attachments = [...this.assessmentToEdit.attachments];
        console.log("anexos da avaliação...");
        console.dir(this.attachments);
      }

    }
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    };

    const loading = await this.loadingCtrl.create({message: 'Salvando...'});
    await loading.present();

    const formData = this.prepareFormData();

    let obs;
    if (this.isEditMode && this.assessmentToEdit) {
      obs = this.studentService.updateAssessment(this.assessmentToEdit.id, formData);
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

  prepareFormData() {
    const val = this.form.value;
    const dateStr = val.assessment_date.split('T')[0];
    return {...val, assessment_date: dateStr};
  }
  
  async deleteAssessment() {
    if (!this.assessmentToEdit) return;
    const alert = await this.alertCtrl.create({
      header: 'Excluir Avaliação?',
      message: 'Esta ação não pode ser desfeita.',
      buttons: [
        {text: 'Cancelar', role: 'cancel'},
        {
          text: 'Excluir',
          role: 'destructive',
          handler: async () => {
            const loading = await this.loadingCtrl.create();
            await loading.present();
            this.studentService.deleteAssessment(this.assessmentToEdit!.id).subscribe({
              next: async () => {
                await loading.dismiss();
                this.dismiss('deleted');
              },
              error: async() => {
                await loading.dismiss();
                await this.presentAlert('erro', 'Falha ao excluir');
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  dismiss(data: any) {
    this.modalCtrl.dismiss(data);
  }

  async onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    //Se for uma nova avaliação e ainda não salvamos (não temos ID), salva agora
    if (!this.isEditMode && !this.assessmentToEdit) {
      const saved = await this.saveAssessmentInternal();
      if (!saved) return;
    }
    
    this.isUploading = true;
    const assessmentId = this.assessmentToEdit!.id;

    //Percorre todos os arquivos selecionados e faz upload um por um
    for (let i=0; i<files.length; i++) {
      const file = files[i];
      try {
        const result = await this.studentService.uploadAssessmentFileFlow(file, assessmentId).toPromise();
        //adiciona o resultado (que contém a URL pública) à lista local para exibição
        this.attachments.push(result.data);
      } catch (error) {
        console.error(`Erro ao enviar ${file.name}:`, error);
        await this.presentAlert('erro', 'Falha ao enviar arquivo');
      }
    }

    this.isUploading = false;
    //Limpa o input para permitir selecionar o mesmo arquivo novamente se necessário
    event.target.value='';
  }

  async saveAssessmentInternal(): Promise<boolean> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return false;
    }
    return new Promise(async (resolve) => {
      const loading = await this.loadingCtrl.create({message: 'Iniciando...'});
      await loading.present();

      const formData = this.prepareFormData();

      this.studentService.createAssessment(this.subjectId, formData).subscribe({
        next: async (res) => {
          await loading.dismiss();
          this.assessmentToEdit = res.data;
          this.isEditMode = true;
          resolve(true);
        },
        error: async (err) => {
          await loading.dismiss();
          console.error(err);
          await this.presentAlert('erro', 'Preencha os campos obrigatórios antes de adicionar fotos.');
          resolve(false);
        }
      });
    });
  }

  isImage(att: any): boolean {
    if (!att) return false;
    if (att.file && att.file_type.startsWith('image/')) return true;

    const name = att.file_name || att.file_url || '';
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
  }

  openImage(fileUrl: string) {
    window.open(fileUrl, '_blank');
  }


  async presentAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({ header, message, buttons: ['OK'] });
    await alert.present();
  }

}
