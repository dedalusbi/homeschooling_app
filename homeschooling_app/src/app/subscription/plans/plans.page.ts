import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar, LoadingController } from '@ionic/angular/standalone';
import { SubscriptionService } from '../subscription.service';
import { addIcons } from 'ionicons';
import { bulb, checkmark, close, diamond, people, statsChart } from 'ionicons/icons';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.page.html',
  styleUrls: ['./plans.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonBackButton, IonButton, IonIcon]
})
export class PlansPage implements OnInit {

  constructor(
    private subscriptionService: SubscriptionService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {
    addIcons({
      'diamond': diamond,
      'close': close,
      'checkmark': checkmark,
      'people': people,
      'bulb': bulb,
      'statsChart': statsChart
    });
  }

  ngOnInit() {
  }


  async subscribe(planKey: string) {
    const loading = await this.loadingCtrl.create({message: 'Iniciando pagamento...'});
    await loading.present();

    this.subscriptionService.createCheckoutSession(planKey).subscribe({
      next: async (res) => {
        await loading.dismiss();
        //redireciona o navegador para a página do stripe
        if (res.url) {
          window.location.href = res.url;
        } else {
          this.presentAlert('erro', 'Não foi possível iniciar o pagamento');
        }
      },
      error: async (err) => {
        await loading.dismiss();
        console.error('erro no checkout: ', err);
        this.presentAlert('Erro', 'Falha ao comunicar com o servidor de pagamentos.');
      }
    });
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({header, message, buttons: ['OK']});
    await alert.present();
  }

}
