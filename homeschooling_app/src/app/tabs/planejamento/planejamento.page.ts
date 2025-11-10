import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonAvatar, IonButton, IonButtons, IonCard, IonCardContent, IonChip, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonSelect, IonSelectOption, IonSpinner, IonTitle, IonToolbar, ModalController, NavController } from '@ionic/angular/standalone';
import { ScheduleEntry } from 'src/app/models/schedule-entry.model';
import { BehaviorSubject, forkJoin, lastValueFrom, Observable, take } from 'rxjs';
import { Student } from 'src/app/models/student.model';
import { StudentService } from 'src/app/students/student.service';
import { ScheduleService } from 'src/app/schedule/schedule-service';
import { addIcons } from 'ionicons';
import { add, bookmark, calendar, calendarClear, chevronBack, chevronForward, notifications, star } from 'ionicons/icons';
import { group } from '@angular/animations';
import { Subject } from 'src/app/models/subject.model';
import { AddAulaModalComponent } from 'src/app/components/add-aula-modal/add-aula-modal.component';

interface ScheduleGroup {
  [dayOfWeek: number]: ScheduleEntry[];
}

type DayOfWeek = {label: string, value: number};


@Component({
  selector: 'app-planejamento',
  templateUrl: './planejamento.page.html',
  styleUrls: ['./planejamento.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons,
    IonButton, IonIcon, IonSelect, IonSelectOption, IonFab, IonFabButton, IonCard, IonCardContent,
    IonAvatar, IonItem, IonChip, IonSpinner],
  providers: [DatePipe]
})
export class PlanejamentoPage implements OnInit {

  currentDate = new Date();
  weekStart: Date = new Date();
  weekEnd: Date = new Date();
  weekDisplay: string = '';
  students$ = new BehaviorSubject<Student[]>([]); //Lista de alunos para o filtro
  selectedStudentId: string | null = null; //Aluno selecionado no filtro
  scheduleGroupedByDay: ScheduleGroup | null = null;
  scheduleIsEmpty = false;
  isLoading = false;

  onlyMine: boolean = false;

  //definição dos dias da semana
  weekDays: DayOfWeek[] = [
    {label: 'Segunda-feira', value: 1},
    {label: 'Terça-feira', value: 2},
    {label: 'Quarta-feira', value: 3},
    {label: 'Quinta-feira', value: 4},
    {label: 'Sexta-feira', value: 5},
    {label: 'Sábado', value: 6},
    {label: 'Domingo', value: 0},
  ];

  //Lógica de exibição da semana
  currentWeekOffset=0;



  constructor(private studentService: StudentService, private scheduleService: ScheduleService,
    private navCtrl: NavController, private modalCtrl: ModalController, private datePipe: DatePipe
  ) {
    addIcons({
      'notifications': notifications,
      'chevron-back': chevronBack,
      'chevron-forward': chevronForward,
      'bookmark': bookmark,
      'add': add,
      'calendar': calendar,
      'calendar-clear': calendarClear
    });

    this.updateWeekDisplay();
  }

  ngOnInit() {
   
    this.loadStudents();
  }

  loadStudents() {
    this.studentService.getStudents().subscribe({
      next: (res) => {
        this.students$.next(res.data);
        //Se nenhum aluno estiver selecionado, seleciona o primeiro
        if (!this.selectedStudentId && res.data.length > 0) {
          this.selectedStudentId = res.data[0].id || null;
          this.loadSchedule();
        } else if (res.data.length == 0) {
          this.isLoading=false;
          this.scheduleIsEmpty=true;
        }
      },
      error: (err) => {
        console.error("Erro ao buscar alunos:",err);
        this.isLoading=false;
      }
    });
  }


  loadSchedule() {

    
    if (!this.selectedStudentId) {
      //implementar lógica para todos os alunos
      this.scheduleGroupedByDay={};
      this.scheduleIsEmpty=true;
      this.isLoading=false;
      return;
    }

    this.isLoading=true;
    this.scheduleIsEmpty=false;
    this.scheduleGroupedByDay={};

    const weekStartStr = this.datePipe.transform(this.weekStart, 'yyyy-MM-dd')!;
    const weekEndStr = this.datePipe.transform(this.weekEnd, 'yyyy-MM-dd')!;

    let scheduleObservable: Observable<{data: ScheduleEntry[]}>;

    if (this.selectedStudentId=== "all") {
      scheduleObservable = this.scheduleService.getScheduleForAllStudents(this.onlyMine, weekStartStr, weekEndStr);
    } else {
      scheduleObservable = this.scheduleService.getScheduleForStudent(this.selectedStudentId, this.onlyMine, weekStartStr, weekEndStr);
    }


    scheduleObservable.subscribe({
      next: (res) => {
        this.scheduleGroupedByDay = this.groupScheduleByDay(res.data);
        this.scheduleIsEmpty = res.data.length ===0;
        this.isLoading=false;
      },
      error: (err) => {
        console.error("Erro ao carregar cronograma:",err);
        this.isLoading=false;
        this.scheduleIsEmpty=true;
      }
    });

  }

  updateWeekDisplay() {
    const today = new Date(this.currentDate);
    const dayOfWeek = today.getDay();

    this.weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dayOfWeek);
    this.weekEnd = new Date(this.weekStart.getFullYear(), this.weekStart.getMonth(), this.weekStart.getDate() +6);

    const startDay = this.datePipe.transform(this.weekStart, 'd');
    const startMonth = this.datePipe.transform(this.weekStart, 'MMM');
    const endDay = this.datePipe.transform(this.weekEnd, 'd');
    const endMonth = this.datePipe.transform(this.weekEnd, 'MMM');
    const year = this.datePipe.transform(this.weekEnd, 'yyyy');

    if (startMonth === endMonth) {
      this.weekDisplay = `${startDay} a ${endDay} de ${startMonth} ${year}`;
    } else {
      this.weekDisplay = `${startDay} ${startMonth} a ${endDay} ${endMonth} ${year}`;
    }
  }


  private groupScheduleByDay(schedule: ScheduleEntry[]): ScheduleGroup {
    const grouped: ScheduleGroup = {};

    for (const aula of schedule) {
      if (!grouped[aula.day_of_week]){
        grouped[aula.day_of_week] = [];
      }
      //TODO Lógica para status concluída/pendente
      aula.status='Pendente';
      grouped[aula.day_of_week].push(aula);
    }
    //Ordena as aulas dentro de cada dia pelo horário de início
    for (const day in grouped) {
      grouped[day].sort((a,b) => a.start_time.localeCompare(b.start_time));
    }
    return grouped;
  }



  //Função para abrir o modal de Adicionar Aula
  async openAddModal() {

    const alunos = this.students$.getValue();

    const modal = this.modalCtrl.create({
      component: AddAulaModalComponent,
      componentProps: {
        alunos: alunos,
        alunoSelecionadoId: this.selectedStudentId
      },
      breakpoints: [0, 0.9, 1],
      initialBreakpoint: 0.9,
      cssClass: 'add-aula-modal'
    });

    (await modal).present();

    const {data, role} = await (await modal).onWillDismiss();
    if (role === 'confirm') {
      this.loadSchedule();
    }

  }

  

  //Placeholder para o modal de edição
  async openEditModal(aula: ScheduleEntry) {
    console.log("Abrir modal de edição para: ", aula);
  }


  //Funções auxiliares de UI
  changeWeek(direction: number) {
    this.currentDate.setDate(this.currentDate.getDate()+(7*direction));
    this.updateWeekDisplay();
    this.loadSchedule();
  }

  saveAsTemplate() {
    console.log("Salvar como modelo");
  }

  getDayDate(dayOfWeek: number) {
    const date = new Date(this.weekStart);
    date.setDate(date.getDate()+dayOfWeek);
    return date;
  }

  formatTime(time: string) {
    return time.substring(0,5);
  }

  getSubjectColor(subjectName: string): string {
    //TODO Lógica de cores
    //placeholder
    return '#3A5A92';
  }


}
