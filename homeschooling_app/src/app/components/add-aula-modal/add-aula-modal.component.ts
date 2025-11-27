import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AlertController, IonButton, IonButtons, IonCheckbox, IonContent, IonDatetime, IonFooter, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonModal, IonRadio, IonRadioGroup, IonSelect, IonSelectOption, IonTextarea, IonTitle, IonToolbar, LoadingController, ModalController, NavController } from '@ionic/angular/standalone';
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
    IonIcon, IonContent, IonLabel, IonSelectOption, IonInput, IonItem, IonCheckbox, IonSelect,
    IonModal, IonDatetime, IonFooter, IonRadioGroup, IonRadio, FormsModule, IonTextarea
  ]
})
export class AddAulaModalComponent  implements OnInit {

  @Input() alunos: Student[] = [];
  @Input() alunoSelecionadoId: string | null = null;
  @Input() aulaParaEditar: ScheduleEntry | null = null;
  @Input() selectedDate: string = "";


  materiasDisponiveis$ = new BehaviorSubject<Subject[]>([]);
  materiasLoading = new BehaviorSubject<boolean>(false);

  aulaForm: FormGroup;
  weekDays = WEEK_DAYS_DEF;
  isEditMode = false;
  public loggedInUserId: string | null = null;

  editType: 'single' | 'series' = 'series';

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
      start_time: ['', [Validators.required]],
      end_time: ['', [Validators.required]],
      assigned_guardian_id: [null, [Validators.required]],
      is_recurring: [true],
      days_of_week: this.fb.array(daysOfWeekControls, [this.minDaysSelectedValidator(1)]),
      start_date: [null, [Validators.required]],
      end_date: [null],
      specific_date: [null],
      activities: [''],
      
    }, {validators: [this.endTimeAfterStartValidator, this.endDateAfterStartDateValidator]});


    this.setupConditionalValidators();

  }

  ngOnInit() {

    this.loggedInUserId = this.auth.currentUserId;
    if (this.aulaParaEditar){
      //Modo Edição
      this.isEditMode=true;
      const aula = this.aulaParaEditar;
      console.log("aula");
      console.dir(aula);
      const isRecurring = aula.is_recurring;
      this._updateValidators(isRecurring);
      this.aulaForm.patchValue({
        student_id: aula.student_id,
        subject_id: aula.subject_id,
        start_time: aula.start_time.substring(0,5),
        end_time: aula.end_time.substring(0,5),
        assigned_guardian_id: aula.assigned_guardian_id,
        activities: aula.activities,
        is_recurring: isRecurring,
        start_date: isRecurring ? (aula.start_date ? new Date(aula.start_date + 'T00:00:00').toISOString() : null) : null,
        end_date: isRecurring ? (aula.end_date ? new Date(aula.end_date + 'T00:00:00').toISOString() : null) : null,
        specific_date: !isRecurring ? (aula.specific_date ? new Date(aula.specific_date + 'T00:00:00').toISOString() : null) : null
      });

      if (isRecurring) {
        const activeDays = aula.active_days || [aula.day_of_week];
        const daysCheckBoxes = this.weekDays.map(day =>
          activeDays.includes(day.value)
        );
        this.daysOfWeekArray.setValue(daysCheckBoxes);
        this.daysOfWeekArray.enable();
      }

      //Desativa a troca de aluno e matéria no modo de edição (CRUCIAL)
      this.f['student_id'].disable();
      this.f['subject_id'].disable();

    } else {
      // MODO Criação
      this.isEditMode = false;
     
      this.aulaForm.patchValue({
        student_id: this.alunoSelecionadoId,
        assigned_guardian_id: this.loggedInUserId,
        is_recurring: true
      });

      

      this._updateValidators(true);

    }

    if (this.alunoSelecionadoId) {
        this.loadMateriasParaAluno(this.alunoSelecionadoId);
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


  setupConditionalValidators() {
    const isRecurringControl = this.f['is_recurring'];
    isRecurringControl.valueChanges.subscribe(isRecurring => {
      this._updateValidators(isRecurring);
    });
  }


  private _updateValidators(isRecurring: boolean) {
    
    const daysArray = this.daysOfWeekArray;
    const startDateControl = this.f['start_date'];
    const specificDateControl = this.f['specific_date'];

      if (isRecurring) {
        startDateControl.setValidators([Validators.required]);
        daysArray.setValidators([this.minDaysSelectedValidator(1)]);
        specificDateControl.clearValidators();
        specificDateControl.setValue(null);
      } else {
        specificDateControl.setValidators([Validators.required]);
        
        startDateControl.clearValidators();
        startDateControl.setValue(null);
        daysArray.clearValidators();
        daysArray.controls.forEach(control => control.setValue(false));
      }

      startDateControl.updateValueAndValidity();
      daysArray.updateValueAndValidity();
      specificDateControl.updateValueAndValidity();
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

  endDateAfterStartDateValidator(form: AbstractControl): ValidationErrors | null {
    const start = form.get('start_date')?.value;
    const end = form.get('end_date')?.value;
    if (start && end && new Date(end) < new Date(start)) {
      return { endDateAfterStartDateValidator: true};
    }
    return null;
  }

  async onSubmit() {

    if (this.aulaForm.invalid) {
      this.aulaForm.markAllAsTouched();
      return;
    }

    const loading = await this.loadingCtrl.create({message: "Salvando..."});
    await loading.present();

    const formValue = this.aulaForm.getRawValue();

  

    //prepara o payload para a API
    let payload:any = {
      student_id: formValue.student_id,
      subject_id: formValue.subject_id,
      assigned_guardian_id: formValue.assigned_guardian_id,
      start_time: formValue.start_time,
      end_time: formValue.end_time,
      is_recurring: formValue.is_recurring,
      activities: formValue.activities
    };            
    
    if (formValue.is_recurring) {
      const selectedDays = this.weekDays.map((day, index) => formValue.days_of_week[index] ? day.value : -1)
                                        .filter(value => value !== -1);
      const startDateFormatted = formValue.start_date ? new Date(formValue.start_date).toISOString().split('T')[0] : null;
      const endDateFormatted = formValue.end_date ? new Date(formValue.end_date).toISOString().split('T')[0] : null;
      payload = {
        ...payload,
        days_of_week: selectedDays,
        start_date: startDateFormatted,
        end_date: endDateFormatted,
        is_recurring: true,
        specific_date: null,
      };
    } else {
      const specificDateFormatted = formValue.specific_date ? new Date(formValue.specific_date).toISOString().split('T')[0] : null;
      payload = {
        ...payload,
        specific_date: specificDateFormatted,
        start_date: null,
        days_of_week: [],
        day_of_week: null,
        is_recurring: false,
        end_date: null
      };
    }

    console.log("Payload a enviar: ");
    console.dir(payload);


    if (this.isEditMode && this.aulaParaEditar) {

      if (this.aulaParaEditar.is_recurring && this.editType === 'single') {
        //Modo EXCEÇÃO
        const dateOfException = this.selectedDate;

        this.scheduleService.createScheduleException(
          this.aulaParaEditar.id,
          dateOfException,
          payload
        ).subscribe({
          next: async (res) => {
            await loading.dismiss();
            this.dismissModal(res.data, 'confirm');
          },
          error: async (err) => {
            await loading.dismiss();
            console.error("Erro ao atualizar aula: ", err);
            let message = "Não foi possível atualizar a aula.";
            if (err.status === 409 && err.error?.error?.includes("Conflito")) {
              message = this.formatConflictError(err.error.details);
            }
            await this.presentAlert('Erro', message);
          }
        });

      } else {
        this.scheduleService.updateSchedule(this.aulaParaEditar.id, payload).subscribe({
        next: async (res) => {
          await loading.dismiss();
          this.dismissModal(res.data, 'confirm');
        },
        error: async (err) => {
          await loading.dismiss();
          console.error("Erro ao atualizar aula: ", err);
          let message = "Não foi possível atualizar a aula.";
          if (err.status === 409 && err.error?.error?.includes("Conflito")) {
            message = this.formatConflictError(err.error.details);
          }
          await this.presentAlert('Erro', message);
        }
      });
      }

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
      return 'Conflito de horário detectado.';
    }

    const dayMap = ["Domingo", "Segunda","Terça","Quarta",
      "Quinta","Sexta","Sábado"];

    const c = conflicts[0];
    const start = c.start_time.substring(0,5);
    const end = c.end_time.substring(0,5);

    let diaInfo = '';
    if (c.specific_date) {
      //se for conflito com uma aula única, mostra a data (ex.: 25/11)
      const [year, month, day] = c.specific_date.split('-');
      diaInfo = `dia ${day}/${month}`;
    } else if (c.day_of_week !== null) {
      //se for conflito com recorrente, mostra o dia da semana
      diaInfo = dayMap[c.day_of_week]
    }

    let message = `Conflito com a aula de ${c.subject_name} na ${diaInfo}, das ${start} às ${end}`;

    if (conflicts.length > 1) {
      message += ` (+ ${conflicts.length-1} outros(s) conflito(s))`;
    }

    return message;

  }



  dismissModal(data: any, role: 'confirm' | 'cancel' = 'cancel') {
    this.modalCtrl.dismiss(data, role);
  }

  async excluirAula() {
    if (!this.aulaParaEditar) return;

    const isRecurring = this.aulaParaEditar.is_recurring;
    const specificDate = this.aulaParaEditar.specific_date;

    if (isRecurring) {
      //Caso Recorrente : Mostra opções
      const alert = await this.alertCtrl.create({
        header: 'Excluir aula',
        subHeader: 'Excluir aula recorrente',
        message: 'Esta aula se repete. O que você gostaria de excluir?',
        cssClass: 'custom-alert',
        buttons: [
          {
            text: 'Apenas a aula nesta data',
            cssClass: 'alert-button-danger',
            handler: () => {
              this.performDelete('occurrence');
            }
          },
          {
            text: 'Todas as ocorrências desta aula.',
            cssClass: 'alert-button-danger-outline',
            handler: () => {
              this.performDelete('series');
            }
          },
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'alert-button-cancel'
          }
        ]
      });

      await alert.present();
    } else {
      // -- Caso Aula Única; Confirmação Simples
      const alert = await this.alertCtrl.create({
        header: 'Excluir aula',
        message: 'Tem certeza que deseja excluir esta aula?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Excluir',
            role: 'destructive',
            handler: () => {
              this.performDelete('series');  
            }
          }
        ]
      });
      await alert.present();
    }

  }

  private async performDelete(type: 'occurrence' | 'series') {
    const loading = await this.loadingCtrl.create({message: 'Excluindo...'});
    await loading.present();

    const aulaId = this.aulaParaEditar!.id;
    const dateToDelete = this.selectedDate || new Date().toISOString().split('T')[0];
    let deleteObs;

    if (type === 'occurrence') {
      console.log(`Excluindo ocorrência de ${aulaId} na data de ${dateToDelete}`);
      deleteObs = this.scheduleService.deleteOccurrence(aulaId, dateToDelete);
    } else {
      console.log(`Excluindo série/aula completa ${aulaId}`);
      deleteObs = this.scheduleService.deleteSchedule(aulaId);
    }

    deleteObs.subscribe({
      next: async () => {
        await loading.dismiss();
        this.dismissModal(null, 'confirm');
        await this.presentAlert('Sucesso', 'Aula Excluída.');
      },
      error: async (err) => {
        await loading.dismiss();
        console.error("Erro ao excluir:", err);
        await this.presentAlert('Erro', 'Não foi possível excluir a aula.');
      }
    });

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
