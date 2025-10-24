import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertController, IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonLabel, IonTitle, IonToolbar, LoadingController, NavController } from '@ionic/angular/standalone';
import { Auth } from '../auth';
import { addIcons } from 'ionicons';
import { eye, eyeOff, logIn, logoGoogle, mail, person, personAdd } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,
    IonButtons, IonBackButton, IonLabel, IonIcon, IonInput, ReactiveFormsModule,
    IonButton
  ]
})
export class LoginPage implements OnInit {

  loginForm: FormGroup;
  showPassword=false;

  get f() {return this.loginForm.controls;}

  constructor(private fb: FormBuilder, private navCtrl: NavController, private authService: Auth,
    private loadingCtrl: LoadingController, private alertCtrl: AlertController
  ) {

    addIcons({
          'person-add': personAdd,
          'person': person,
          'mail': mail,
          'eye-off': eyeOff,
          'eye': eye,
          'log-in': logIn
    
        });

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit() {
  }

  //Alterna visibilidade da senha
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  //Submissão do formulário
  async onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const loading = await this.loadingCtrl.create({message: 'Entrando...'});
    await loading.present();
    const {email, password} = this.loginForm.value;

    //Chama API de login
    this.authService.login(email, password).subscribe({
      next: async (res: any) => {
        await loading.dismiss();
        console.log('Token recebido:', res.token);

        this.navCtrl.navigateRoot('/tabs/tab1');
      },
      error: async (err) => {
        await loading.dismiss();
        await this.presentAlert('Erro', 'Email ou senha inválidos.');
      }
    });

  }

  goToRegister() {
    this.navCtrl.navigateForward('/auth/register');
  }

  goToForgotPassword() {
    this.navCtrl.navigateForward('/auth/forgot-password');
  }


  async presentAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({header, message, buttons: ['OK']});
    await alert.present();
  }
  

}
