import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonTitle, IonToolbar, LoadingController, NavController } from '@ionic/angular/standalone';
import { User } from 'src/app/models/user.model';
import { Auth } from 'src/app/auth/auth';
import { addIcons } from 'ionicons';
import { create, diamond, documentText, download, logOut, person, settings, statsChart, time } from 'ionicons/icons';
import { SubscriptionService } from 'src/app/subscription/subscription.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonButton, IonIcon,
    IonItem, IonLabel
  ]
})
export class ProfilePage implements OnInit {

  user: User | null = null;

  constructor(
    private authService: Auth,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private alertCtrl:AlertController,
    private subscriptionService: SubscriptionService
  ) {
    addIcons({
      person, create, diamond, documentText, statsChart, download, settings, logOut, time
    });
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  ionViewWillEnter() {
    this.user = null;
    this.loadUserProfile();
  }

  async loadUserProfile() {
    this.user=null;
    this.authService.getProfile().subscribe({
      next: (res) => {
        this.user = res.data;
      },
      error: (err) => console.error("Erro ao carregar perfil", err)
    });
  }

  manageSubscription() {
    if (!this.user) return;
    
    this.navCtrl.navigateForward('/plans');
    
  }

  async logout() {
    await this.authService.logout();
  }

  async cancelChange() {
    const alert = await this.alertCtrl.create({
      header: 'Cancelar mudança?',
      message: 'Você permanecerá no seu plano atual e a mudança agendada será descartada.',
      buttons: [
        {
          text: 'Voltar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.executeCancelChange();
          }
        }
      ]
    });
    await alert.present();
  }


  async executeCancelChange() {
    const loading = await this.loadingCtrl.create({message: 'Cancelando agendamento...'});
    await loading.present();

    this.subscriptionService.cancelScheduledChange().subscribe({
      next: async () => {
        await loading.dismiss();
        this.loadUserProfile();

        const toast = await this.alertCtrl.create({
          header: 'Pronto',
          message: 'A mudança foi cancelada. Você continua no seu plano atual.',
          buttons: ['OK']
        });
        await toast.present();
      },
      error: async (err) => {
        await loading.dismiss();
        console.error(err);
      }
    });
  }

}
