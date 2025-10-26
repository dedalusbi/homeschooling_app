import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AlertController, IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonLabel, IonTitle, IonToolbar, LoadingController, NavController } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { Auth } from '../auth';
import { addIcons } from 'ionicons';
import { checkmarkCircle, eye, eyeOff, shieldCheckmark } from 'ionicons/icons';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule,
    FormsModule, IonButtons, IonBackButton, IonIcon, IonLabel, IonInput, IonButton]
})
export class ResetPasswordPage implements OnInit {

  resetPasswordForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  resetToken: string | null = null;
  
  get f() {return this.resetPasswordForm.controls;}

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: Auth,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private navCtrl: NavController
  ) {


    addIcons({
      'shield-checkmark': shieldCheckmark,
      'eye-off': eyeOff,
      'eye': eye,
      'checkmark-circle': checkmarkCircle
    });

    //Criando o formulário com validação de comprimento mínimo e confirmação
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, {validators: this.passwordMatchValidator});
  }

  ngOnInit() {
    //Extrai o token do query parameter  'token' da URL
    this.resetToken = this.route.snapshot.queryParamMap.get('token');

    if (!this.resetToken) {
      console.error('Token de reset não encontrado na URL.');
      this.presentAlert('Erro', 'Link inválido ou expirado. Solicite a recuperação novamente.');
      this.navCtrl.navigateRoot('/auth/login');
    }
  }



  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : {mismatch: true};
  }

  togglePassword(): void {this.showPassword = !this.showPassword;}
  toggleConfirmPassword(): void {this.showConfirmPassword = !this.showConfirmPassword;}


  async onSubmit() {
    if (this.resetPasswordForm.invalid || !this.resetToken) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    const loading = await this.loadingCtrl.create({message: 'Redefinindo senha...'});
    await loading.present();

    const {password, confirmPassword} = this.resetPasswordForm.value;

    this.authService.resetPassword(this.resetToken, password, confirmPassword).subscribe({
      next: async (res) => {
        await loading.dismiss();
        await this.presentAlert('Sucesso!','Sua senha foi redefinida com sucesso. Faça o login com a nova senha.')
        this.navCtrl.navigateRoot('/auth/login');
      }, 
      error: async (err) => {
        await loading.dismiss();
        console.error('Erro ao redefinir senha:', err);
        let errorMessage = 'Ocorreu um erro. Tente novamente.';
        if (err.error?.error) {
          errorMessage = err.error.error;
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
