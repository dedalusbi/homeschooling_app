import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { AlertController, IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonLabel, IonTitle, IonToolbar, LoadingController, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { headset, helpCircle, keyOutline, mail, send } from 'ionicons/icons';
import { Auth } from '../auth';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons,
    IonBackButton, IonIcon, IonLabel, IonInput, IonButton]
})
export class ForgotPasswordPage implements OnInit {

  forgotPasswordForm: FormGroup;

  get f() {return this.forgotPasswordForm.controls;}

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private navCtrl: NavController
  ) {
    addIcons({
              'key-outline': keyOutline,
              'mail': mail,
              'send': send,
              'help-circle': helpCircle,
              'headset': headset
            });
    
    //Cria o formulário com validação de email
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
  }

  //Função chamada ao submeter o formulário
  async onSubmit() {

    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    const loading = await this.loadingCtrl.create({message: "Enviando link..."});
    await loading.present();

    const email = this.forgotPasswordForm.value.email;

    // Chama o método RequestPasswordReset do AuthService
    this.authService.requestPasswordReset(email).subscribe({
      next: async (res) => {
        await loading.dismiss();
        // Exibe mensagem de sucesso genérica (por segurança, não confirma se o email existe)
        await this.presentAlert(
          'Verifique seu email',
          'Se o endereço de email estiver registrado, você receberá um link para redefinir sua senha em breve.'
        );
      },
      error: async(err) => {
        await loading.dismiss();
        console.error('Erro ao solicitar recuperação: ', err);
        await this.presentAlert('Erro', 'Ocorreu um erro ao tentar enviar o link. Tente novamente mais tarde.');
      }
    });

  }

  goToLogin() {
    this.navCtrl.navigateBack('/auth/login');
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({header, message, buttons: ['OK']});
    await alert.present();
  }

}
