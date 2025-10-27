import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { AlertController, IonContent, IonHeader, IonTitle, IonToolbar, LoadingController, NavController } from '@ionic/angular/standalone';
import { Student } from '../student';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-student-form',
  templateUrl: './student-form.page.html',
  styleUrls: ['./student-form.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class StudentFormPage implements OnInit {

  studentForm: FormGroup;
  pageTitle = 'Adicionar aluno';
  studentId: string | null = null; //Para saber se estamos em modo de edição

  //Definição das opções para os dropdowns
  readonly caracteristicaOptions: string[]=[
    '',
    '',
    '',
    '',
  ];
  readonly descricaoOptionsMap: {[key: string]: string[]} = {
    '':[],
    '':[],
    '':[],
    '':[],
    '':[],
  };


  get f() {return this.studentForm.controls;}

  constructor(
    private fb: FormBuilder,
    private studentService: Student,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private route: ActivatedRoute,
    private location: Location
  ) {

    this.studentForm = this.fb.group({
      name: ['', [Validators.required]],
      birth_date: [null],
      grade_level: [null],
      individualities: [null]
    });

  }

  ngOnInit() {
    this.studentId = this.route.snapshot.paramMap.get('id');
    if (this.studentId) {
      this.pageTitle = 'Editar aluno';
      // TODO: carregar dados do aluno usando studentService.getStudentsById
      //e preencher o formulário com this.studentForm.patchValue
      console.log('Modo edição para aluno ID: ', this.studentId);
    } else {
      this.pageTitle = 'Adicionar aluno';
      console.log('Modo adição');
    }
  }


  async onSubmit() {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }

    const loading = await this.loadingCtrl.create({message: 'Salvando...'});
    await loading.present();

    //prepara os dados do formulário
    const formData = this.studentForm.value;
  }

}
