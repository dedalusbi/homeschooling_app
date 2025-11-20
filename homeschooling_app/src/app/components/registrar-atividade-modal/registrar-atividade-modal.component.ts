import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertController, IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonIcon, IonLabel, IonTextarea, IonToolbar, LoadingController, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { camera, checkmark, close, save } from 'ionicons/icons';
import { ScheduleEntry } from 'src/app/models/schedule-entry.model';
import { ScheduleService } from 'src/app/schedule/schedule-service';

@Component({
  selector: 'app-registrar-atividade-modal',
  templateUrl: './registrar-atividade-modal.component.html',
  styleUrls: ['./registrar-atividade-modal.component.scss'],
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent, IonLabel, IonTextarea, IonFooter],
  standalone: true,
})
export class RegistrarAtividadeModalComponent  implements OnInit {

  @Input() aula!: ScheduleEntry;
  @Input() dataOcorrencia!: string;

  status: 'completed' | 'missed' = 'completed';
  notes: string = '';

  constructor(
    private modalCtrl: ModalController, private scheduleService: ScheduleService, private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {
    addIcons({
      'close': close, 'checkmark': checkmark, 'camera': camera, 'save': save
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

}
