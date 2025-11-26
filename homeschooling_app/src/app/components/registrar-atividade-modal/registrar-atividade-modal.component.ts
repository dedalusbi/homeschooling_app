import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonIcon, IonLabel, IonSpinner, IonTextarea, IonToolbar, LoadingController, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addCircle, camera, checkmark, close, documentTextOutline, save } from 'ionicons/icons';
import { ScheduleEntry } from 'src/app/models/schedule-entry.model';
import { ScheduleService } from 'src/app/schedule/schedule-service';

@Component({
  selector: 'app-registrar-atividade-modal',
  templateUrl: './registrar-atividade-modal.component.html',
  styleUrls: ['./registrar-atividade-modal.component.scss'],
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent, IonLabel, IonTextarea, IonFooter, IonSpinner],
  standalone: true,
})
export class RegistrarAtividadeModalComponent  implements OnInit {

  @Input() aula!: ScheduleEntry;
  @Input() dataOcorrencia!: string;

  status: 'completed' | 'missed' = 'completed';
  notes: string = '';

  isUploading = false;
  attachments: any[] = [];

  constructor(
    private modalCtrl: ModalController, private scheduleService: ScheduleService, private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {
    addIcons({
      'close': close, 'checkmark': checkmark, 'camera': camera, 'save': save, 'document-text': documentTextOutline,
      'add-circle': addCircle
    });
  }

  ngOnInit() {
    if (this.aula.status) {
      this.status = this.aula.status;
    } else {
      this.status = 'completed';
    }
    if (this.aula.log_notes) {
      this.notes = this.aula.log_notes;
    }
    if (this.aula.log_id) {
      this.loadAttachments(this.aula.log_id);
    }
  }

  loadAttachments(logId: string) {
    this.scheduleService.getAttachments(logId).subscribe({
      next: (res) => {
        console.log("Attachments:");
        console.dir(res.data);
        this.attachments = res.data;
      },
      error: (err) => console.error('Erro ao carregar anexos:', err)
    });
  }

  setStatus(newStatus: 'completed' | 'missed') {
    this.status=newStatus;
  }

  async saveLog() {
    if (!this.status) {
      return;
    }
    const loading = await this.loadingCtrl.create({message: 'Salvando registro...'});
    await loading.present();

    const logData = {
      log_date: this.dataOcorrencia,
      status: this.status,
      notes: this.notes
    };

    this.scheduleService.createDailylog(this.aula.id, logData).subscribe({
      next: async (res) => {
        await loading.dismiss();
        this.modalCtrl.dismiss(res.data, 'confirm');
      },
      error: async (err) => {
        await loading.dismiss();
        console.error('erro ao salvar log:', err);
        const alert = await this.alertCtrl.create({
          header: 'Erro',
          message: 'Não foi possível salvar o registro. Tente novamente.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  dismiss(data: any) {
    this.modalCtrl.dismiss(data, 'cancel');
  }

  //disparada quando o utilizador escolhe arquivos...
  async onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    //garante que temos um log_id (salva o texto primeiro se for novo)
    if (!this.aula.log_id) {
      const saved = await this.saveLogInternal();
      if (!saved) return;
    }

    this.isUploading = true;

    //Percorre todos os arquivos selecionados e faz upload um por um
    for (let i=0; i<files.length; i++) {
      const file = files[i];
      try {
        const result = await this.scheduleService.uploadfileFlow(file, this.aula.log_id!).toPromise();
        //adiciona o resultado (que contém a URL pública) à lista local para exibição
        this.attachments.push(result.data);
      } catch (error) {
        console.error(`Erro ao enviar ${file.name}:`, error);
      }
    }

    this.isUploading = false;
    //Limpa o input para permitir selecionar o mesmo arquivo novamente se necessário
    event.target.value='';
  }

  //Função auxiliar para salvar silenciosamente e obter o ID
  async saveLogInternal(): Promise<boolean> {
    return new Promise((resolve) => {
      const logData = {log_date: this.dataOcorrencia, status: this.status, notes: this.notes};
      this.scheduleService.createDailylog(this.aula.id, logData).subscribe({
        next: (res) => {
          //atualiza o objeto aula local com o novo ID e dados
          this.aula.log_id = res.data.id;
          this.aula.status = res.data.status;
          resolve(true);
        },
        error: (err) => {
          console.error(err);
          this.alertCtrl.create({header: 'Erro', message: 'Salve o registro antes de anexar arquivos.', buttons: ['OK']}).then(a => a.present());
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

}
