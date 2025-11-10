import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AlertController, IonButton, IonButtons, IonCheckbox, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonSelect, IonSelectOption, IonTitle, IonToolbar, LoadingController, ModalController, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, sparkles } from 'ionicons/icons';
import { BehaviorSubject, first } from 'rxjs';
import { Auth } from 'src/app/auth/auth';
import { ScheduleEntry } from 'src/app/models/schedule-entry.model';
import { Student } from 'src/app/models/student.model';
import { Subject } from 'src/app/models/subject.model';
import { ScheduleService } from 'src/app/schedule/schedule-service';
import { StudentService } from 'src/app/students/student.service';

const WEEK_DAYS_DEF = [
  {label: 'Domingo', short: 'D', value: 0},
  {label: 'Segunda-feira', short: 'S', value: 1},
  {label: 'Terça-feira', short: 'T', value: 2},
  {label: 'Quarta-feira', short: 'Q', value: 3},
  {label: 'Quinta-feira', short: 'Q', value: 4},
  {label: 'Sexta-feira', short: 'S', value: 5},
  {label: 'Sábado', short: 'S', value: 6},
];


@Component({
  selector: 'app-add-aula-modal',
  templateUrl: './add-aula-modal.component.html',
  styleUrls: ['./add-aula-modal.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonIcon, IonContent, IonLabel, IonSelectOption, IonInput, IonItem, IonCheckbox, IonSelect
  ]
})
export class AddAulaModalComponent  implements OnInit {

  @Input() alunos: Student[] = [];
  @Input() alunoSelecionadoId: string | null = null;
  @Input() aulaParaEditar: ScheduleEntry | null = null;


  materiasDisponiveis$ = new BehaviorSubject<Subject[]>([]);
  materiasLoading = new BehaviorSubject<boolean>(false);

  aulaForm: FormGroup;
  weekDays = WEEK_DAYS_DEF;
  isEditMode = false;

  get f() {return this.aulaForm.controls;}
  get daysOfWeekArray() {return this.aulaForm.get('days_of_week') as FormArray;}

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private studentService: StudentService,
    private scheduleService: ScheduleService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private auth: Auth
  ) {

    addIcons({
      'close': close,
      'sparkles': sparkles
    });

    const daysOfWeekControls = this.weekDays.map(day => this.fb.control(false));

    this.aulaForm = this.fb.group({
      student_id: [null, [Validators.required]],
      subject_id: [null, [Validators.required]],
      days_of_week: this.fb.array(daysOfWeekControls, [this.minDaysSelectedValidator(1)]),
      start_time: ['', [Validators.required]],
      end_time: ['', [Validators.required]],
      assigned_guardian_id: [null, [Validators.required]], //TODO carregar responsáveis
    }, {validators: this.endTimeAfterStartValidator});

  }

  ngOnInit() {
    if (this.aulaParaEditar){
      //Modo Edição
      this.isEditMode=true;
      this.aulaForm.patchValue({
        student_id: this.aulaParaEditar.student_id,
        subject_id: this.aulaParaEditar.subject_id,
        start_time: this.aulaParaEditar.start_time,
        end_time: this.aulaParaEditar.end_time,
        assigned_guardian_id: this.aulaParaEditar.assigned_guardian_id,
      });
      this.daysOfWeekArray.at(this.aulaParaEditar.day_of_week).setValue(true);

      if (this.aulaParaEditar.student_id) {
        this.loadMateriasParaAluno(this.aulaParaEditar.student_id);
      }

      this.f['student_id'].disable();

    } else {
      // MODO Criação
      this.isEditMode = false;
      const loggedInUserId = this.auth.currentUserId;

      this.aulaForm.patchValue({
        student_id: this.alunoSelecionadoId,
        assigned_guardian_id: loggedInUserId
      });

      if (this.alunoSelecionadoId) {
        this.loadMateriasParaAluno(this.alunoSelecionadoId);
      }

    }

    this.f['student_id'].valueChanges.subscribe(alunoId => {
      if (alunoId) {
        this.f['subject_id'].setValue(null);
        this.loadMateriasParaAluno(alunoId);
      } else {
        this.materiasDisponiveis$.next([]);
      }
    });

  }


  loadMateriasParaAluno(alunoId: string) {
    this.materiasLoading.next(true);
    this.studentService.getSubjects(alunoId, 'active').subscribe({
      next: (res) => {
        this.materiasDisponiveis$.next(res.data || []);
        this.materiasLoading.next(false);
      },
      error: (err) => {
        console.error("Erro ao carregar matérias:",err);
        this.materiasDisponiveis$.next([]);
        this.materiasLoading.next(false);
      }
    });
  }


  //Validadores
  minDaysSelectedValidator(min=1) {
    return (formArray: AbstractControl): ValidationErrors | null => {
      const selectedCount = (formArray as FormArray).controls
        .map(control => control.value)
        .reduce((acc, curr) => curr ? acc + 1 : acc, 0);
      return selectedCount >= min ? null : {minDaysSelected: true};
    }
  }
  endTimeAfterStartValidator(form: AbstractControl): ValidationErrors | null {
    const start = form.get('start_time')?.value;
    const end = form.get('end_time')?.value;
    return (start && end && end <= start) ? {endTimeAfterStart: true} : null;

  }

  async onSubmit() {

    if (this.aulaForm.invalid) {
      this.aulaForm.markAllAsTouched();
      return;
    }

    const loading = await this.loadingCtrl.create({message: "Salvando..."});
    await loading.present();

    const formValue = this.aulaForm.getRawValue();

    //Converte o array de boleanos para um array de números
    const selectedDays = this.weekDays.map((day, index) => formValue.days_of_week[index] ? day.value : -1)
                                        .filter(value => value !== -1);

    //prepara o payload para a API
    const payload = {
      student_id: formValue.student_id,
      subject_id: formValue.subject_id,
      start_time: formValue.start_time,
      end_time: formValue.end_time,
      assigned_guardian_id: formValue.assigned_guardian_id,
      days_of_week: selectedDays,
    };            
    
    if (this.isEditMode && this.aulaParaEditar) {
      //LÓGICA DE ATUALIZAÇÃO
      console.log("Atualizar Aula:", this.aulaParaEditar.id, payload);
      await loading.dismiss();
      this.dismissModal(payload, 'confirm');
    } else {
      //LÓGICA DE CRIAÇÃO
      this.scheduleService.createSchedule(payload).subscribe({
        next: async (res) => {
          await loading.dismiss();
          this.dismissModal(res.data, 'confirm');
        },
        error: async (err) => {
          await loading.dismiss();
          console.error("Erro ao criar aula:",err);
          let header = "Erro ao Salvar";
          let message = "Não foi possível salvar a aula. Tente novamente.";

          if (err.status == 409 && err.error?.error?.includes("Conflito de horário")) {
            header="Conflito de horário";
            message = this.formatConflictError(err.error.details);
          } else if (err.status == 422) {
            if (err.error?.errors) {
              message = Object.values(err.error.errors).flat().join(' ');
            } else{
              message="Por favor, verifique os campos. O horário de término deve ser após o início.";
            }
          }

          await this.presentAlert(header, message);
        }
      });
    }

  }

  private formatConflictError(conflicts: any[]): string {
    if (!conflicts || conflicts.length === 0) {
      return 'Foi detectado um conflito de horário com uma aula existente;';
    }

    const dayMap = ["Domingo", "Segunda-feira","Terça-feira","Quarta-feira",
      "Quinta-feira","Sexta-feira","Sábado"];
    
    const firstConflict = conflicts[0];
    const dayName = dayMap[firstConflict.day_of_week] || 'Um dia';
    const subjectName = firstConflict.subject_name;
    const startTime = firstConflict.start_time.substring(0,5);

    let message = `Conflito detectado: A aula de "${subjectName}" na ${dayName} às ${startTime} já está agendada.`;

    if (conflicts.length > 1) {
      message += `(e mais ${conflicts.length -1} outro(s) conflito(s)).`;
    }

    return message;

  }



  dismissModal(data: any, role: 'confirm' | 'cancel' = 'cancel') {
    this.modalCtrl.dismiss(data, role);
  }

  excluirAula() {
    console.log('Excluir aula');
  }

  goToManageSubjects() {
    this.navCtrl.navigateForward('/manage-subjects/'+this.f['student_id'].value);
    this.dismissModal(null, 'cancel');
  }


  async presentAlert(header: string, message: string) {
    const alert = this.alertCtrl.create({
      header, message, buttons: ['OK']
    });
    (await alert).present();
  }

}
