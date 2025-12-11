import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar, LoadingController, NavController } from '@ionic/angular/standalone';
import { SubscriptionService } from '../subscription.service';
import { addIcons } from 'ionicons';
import { bulb, checkmark, close, diamond, people, statsChart } from 'ionicons/icons';
import { User } from 'src/app/models/user.model';
import { Auth } from 'src/app/auth/auth';

//Atualize a função subscribe para decidir entre Checkout ou API:

const PLAN_LEVELS: {[key: string]: number} = {
  'essential': 0,
  'family': 1,
  'educator': 2
};

@Component({
  selector: 'app-plans',
  templateUrl: './plans.page.html',
  styleUrls: ['./plans.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonBackButton, IonButton, IonIcon]
})
export class PlansPage implements OnInit {


  user: User | null = null;

  constructor(
    private subscriptionService: SubscriptionService,
    private authService: Auth,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private navCtrl: NavController
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
    this.loadUserProfile();
  }

  async loadUserProfile() {
    this.authService.getProfile().subscribe({
      next: (res) => {
        this.user = res.data;
      },
      error: (err) => console.error("Erro ao carregar perfil para verificar alunos.")
    });
  }


  async subscribe(planKey: string) {
    const loading = await this.loadingCtrl.create({message: 'Iniciando pagamento...'});
    await loading.present();

    const state = this.getButtonState(planKey);

    if (state.action === 'current' || state.action === 'disabled') {
      await loading.dismiss();
      return;
    }

    //Aviso de downgrade
    if (state.action === 'downgrade') {
      await loading.dismiss();
      const alert = await this.alertCtrl.create({
        header: 'Confirmar Downgrade',
        message: 'Ao mudar para um plano inferior, você manterá seus benefícios atuais até o fim do ciclo de cobrança. Após essa data, funcionalidades extras serão bloqueadas.',
        buttons: [
          {text: 'Cancelar', role: 'cancel'},
          {text: 'Confirmar', handler: async () => {
            const newLoading = await this.loadingCtrl.create({message: 'Alterando plano...'});
            await newLoading.present();
            this.executeChange(planKey, newLoading);
            this.loadUserProfile();
          }}
        ]
      });
      await alert.present();
      return;
    }

    this.executeChange(planKey, loading);

  }

  async executeChange(planKey: string, loading: HTMLIonLoadingElement) {
    
    if (this.user?.subscription_tier === 'essential') {
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
    } else {
      this.subscriptionService.changePlan(planKey).subscribe({
        next:  async () => {
          await loading.dismiss();
          //redireciona o navegador para a página do stripe
          this.presentAlert('Sucesso', 'Plano alterado com sucesso!');
          this.loadUserProfile();
        },
        error: async (err) => {
          await loading.dismiss();
          console.error('erro no checkout: ', err);
          this.presentAlert('Erro', 'Falha ao comunicar com o servidor de pagamentos.');
        }
      });
    }

    
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({header, message, buttons: ['OK']});
    await alert.present();
  }

  
  getButtonState(targetPlan: string): {label: string, action: 'upgrade' | 'downgrade' | 'current' | 'disabled', color: string} {
    if (!this.user) return {label: 'Carregando...', action: 'disabled', color: 'medium'};

    const currentLevel = PLAN_LEVELS[this.user.subscription_tier];
    const targetLevel = PLAN_LEVELS[targetPlan];

    if (currentLevel === targetLevel) {
      if (this.user.cancel_at_period_end) {
        return {label: 'Reativar Assinatura', action: 'upgrade', color: 'success'};
      }
      return {label: 'Seu Plano Atual', action: 'current', color: 'medium'};
    }

    if (currentLevel < targetLevel) {
      return {label: 'Fazer upgrade', action: 'upgrade', color: 'success'};
    }

    if (currentLevel > targetLevel) {
      return {label: 'Fazer Downgrade', action: 'downgrade', color: 'medium'};
    }

    return {label: 'Indisponível', action: 'disabled', color: 'medium'};

  }

}
