import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AlertController, IonBackButton, IonButton, IonButtons, IonCheckbox, IonContent, IonHeader, IonIcon, IonInput, IonLabel, IonTitle, IonToolbar, LoadingController, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eye, eyeOff, mail, person, personAdd, personAddOutline } from 'ionicons/icons';
import { Auth } from '../auth';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonToolbar, CommonModule, FormsModule,
    IonButtons, IonBackButton, IonLabel, IonInput, IonIcon, IonCheckbox, IonButton,
    ReactiveFormsModule]
})
export class RegisterPage implements OnInit {

  registerForm: FormGroup;
  showPassword=false;
  showConfirmPassword=false;




  get f() {return this.registerForm.controls;} //Atalho para template


  constructor(private fb: FormBuilder,
    private navCtrl: NavController, private authService: Auth, private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {
    addIcons({
      'person-add': personAdd,
      'person': person,
      'mail': mail,
      'eye-off': eyeOff,
      'eye': eye

    });


    //Cria o formulário com validações
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      terms: [false, [Validators.requiredTrue]]
    }, {validators: this.passwordMatchValidator});

  }

  ngOnInit() {
  }


  //Validador customizado para senhas
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : {mismatch: true}; 
  }

  //Submissão do formulário
  async onSubmit() {

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const loading = await this.loadingCtrl.create({message: 'Criando conta...'});
    await loading.present();
    const {fullName, email, password} = this.registerForm.value;

    //Chama Api
    this.authService.register(fullName, email, password).subscribe({
      next: async (res) => {
        await loading.dismiss();
        await this.presentAlert('Sucesso!', 'Conta criada com sucesso. Faça o login.');
        this.navCtrl.navigateRoot('/auth/login');
      },
      error: async (err) => {
        await loading.dismiss();
        //Formata erro da API
        let errorMessage = 'Ocorreu um erro ao criar a conta.';
        if (err.error?.errors) { //Verifica se 'errors' existe
          const apiErrors = err.error.errors;
          if (apiErrors.email?.includes('has already been taken')) {
            errorMessage = 'Este email já está em uso.';
          } else {
            errorMessage = Object.values(apiErrors).flat().join(' ');
          }
        }
        await this.presentAlert('Erro', errorMessage);
      }
    })


  }

  //Alterna visibilidade de senha
  togglePassword(): void {this.showPassword = !this.showPassword;}
  //Alterna visibilidade de confirmação de senha
  toggleConfirmPassword(): void {this.showConfirmPassword = !this.showConfirmPassword;}

  goToLogin() {
    this.navCtrl.navigateBack('/auth/login');
  }


  //Exibe Alerta
  async presentAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({header, message, buttons: ['OK']});
    await alert.present();
  }

}
