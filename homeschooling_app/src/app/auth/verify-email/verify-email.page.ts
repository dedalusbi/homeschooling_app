import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, IonButton, IonContent, IonHeader, IonIcon, IonLabel, IonSpinner, IonTitle, IonToolbar, LoadingController, NavController } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { Auth } from '../auth';
import { addIcons } from 'ionicons';
import { checkmarkCircle, closeCircle, mail } from 'ionicons/icons';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.page.html',
  styleUrls: ['./verify-email.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonSpinner, IonIcon,
    IonButton, IonLabel
  ]
})
export class VerifyEmailPage implements OnInit {

  isLoading = true;
  verificationStatus: 'success' | 'error' | null = null;
  errorMessage = "Link inválido ou expirado. Tente solicitar novamente.";
  emailForResend: string = '';


  constructor(
    private route: ActivatedRoute,
    private authService: Auth,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {

    addIcons({
      'checkmark-circle': checkmarkCircle,
      'close-circle': closeCircle,
      'mail': mail
    });
  }

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (token) {
      this.authService.verifyEmail(token).subscribe({
        next: (res) => {
          this.verificationStatus = 'success';
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erro na verificação: ', err);
          if (err.error?.error) {
            this.errorMessage = err.error.error;
          }
          this.verificationStatus = 'error';
          this.isLoading = false;
        }
      });
    } else {
      console.error('Nenhum token encontrado para verificação.');
      this.errorMessage='Link de verificação inválido ou em falta.';
      this.verificationStatus = 'error';
      this.isLoading = false;
    }
  }

  goToLogin() {
    this.navCtrl.navigateRoot('/auth/login');
  }

  async resendVerification() {
  // Validação simples do email
    if (!this.emailForResend || !this.emailForResend.includes('@')) {
        await this.presentAlert('Email Inválido', 'Por favor, insira um endereço de email válido.');
        return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Reenviando email de verificação...' });
    await loading.present();

    // Chama o método no AuthService
    this.authService.resendVerificationLink(this.emailForResend).subscribe({
        next: async (res: any) => {
            await loading.dismiss();
            // Exibe a mensagem de sucesso genérica vinda do backend
            await this.presentAlert('Verifique seu Email', res.message || 'Solicitação de reenvio processada. Verifique sua caixa de entrada (incluindo spam).');
            // Opcional: Limpar o campo de email após o sucesso
            // this.emailForResend = '';
        },
        error: async (err) => {
            await loading.dismiss();
            console.error("Erro ao reenviar verificação:", err);
            // Exibe mensagem de erro genérica
            await this.presentAlert('Erro', err.error?.error || 'Não foi possível reenviar o email de verificação. Tente novamente mais tarde.');
        }
    });
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header, message, buttons: ['OK']
    });
    await alert.present();
  }

}
