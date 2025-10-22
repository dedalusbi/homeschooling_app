import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { IonBackButton, IonButton, IonButtons, IonCheckbox, IonContent, IonHeader, IonIcon, IonInput, IonLabel, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eye, eyeOff, mail, person, personAdd, personAddOutline } from 'ionicons/icons';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,
    IonButtons, IonBackButton, IonLabel, IonInput, IonIcon, IonCheckbox, IonButton,
    ReactiveFormsModule]
})
export class RegisterPage implements OnInit {

  registerForm: FormGroup;
  showPassword=false;
  showConfirmPassword=false;




  get f() {return this.registerForm.controls;} //Atalho para template


  constructor(private fb: FormBuilder) {
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
  }

  //Alterna visibilidade de senha
  togglePassword(): void {this.showPassword = !this.showPassword;}
  //Alterna visibilidade de confirmação de senha
  toggleConfirmPassword(): void {this.showConfirmPassword = !this.showConfirmPassword;}

  goToLogin() {
    
  }

}
