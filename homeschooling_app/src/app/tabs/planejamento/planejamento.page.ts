import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonAvatar, IonButton, IonButtons, IonCard, IonCardContent, IonChip, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem, IonSelect, IonSelectOption, IonSpinner, IonTitle, IonToolbar, LoadingController, ModalController, NavController } from '@ionic/angular/standalone';
import { ScheduleEntry } from 'src/app/models/schedule-entry.model';
import { BehaviorSubject, forkJoin, lastValueFrom, Observable, take } from 'rxjs';
import { Student } from 'src/app/models/student.model';
import { StudentService } from 'src/app/students/student.service';
import { ScheduleService } from 'src/app/schedule/schedule-service';
import { addIcons } from 'ionicons';
import { add, bookmark, calendar, calendarClear, calendarNumber, checkmarkCircle, chevronBack, chevronForward, documentText, ellipse, notifications, star } from 'ionicons/icons';
import { group } from '@angular/animations';
import { Subject } from 'src/app/models/subject.model';
import { AddAulaModalComponent } from 'src/app/components/add-aula-modal/add-aula-modal.component';
import { RegistrarAtividadeModalComponent } from 'src/app/components/registrar-atividade-modal/registrar-atividade-modal.component';

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
  isCurrentWeek: boolean = true;

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
    private navCtrl: NavController, private modalCtrl: ModalController, private datePipe: DatePipe,
    private loadingCtrl: LoadingController
  ) {
    addIcons({
      'notifications': notifications,
      'chevron-back': chevronBack,
      'chevron-forward': chevronForward,
      'bookmark': bookmark,
      'add': add,
      'calendar': calendar,
      'calendar-number': calendarNumber,
      'calendar-clear': calendarClear,
      'checkmark-circle': checkmarkCircle,
      'ellipse': ellipse,
      'document-text': documentText
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
        console.log("this.scheduleGroupedByDay = ");
        console.dir(this.scheduleGroupedByDay);
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
    const realToday = new Date();


    //Verifica se 'currentDate' está na mesma semana que 'realToday'
    //Uma forma simples é comparar o início das semanas
    const currentWeekStart = this.getStartOfWeek(today);
    const realWeekStart = this.getStartOfWeek(realToday);

    this.isCurrentWeek = currentWeekStart.getTime() === realWeekStart.getTime();

    const dayOfWeek = today.getDay();

    this.weekStart = currentWeekStart;
    this.weekEnd = new Date(this.weekStart);
    this.weekEnd.setDate(this.weekStart.getDate() + 6);
    this.weekEnd.setHours(23, 59, 59, 999);

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

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }


  goToCurrentWeek() {
    this.currentDate = new Date();
    this.updateWeekDisplay();
    this.loadSchedule();
  }

  private groupScheduleByDay(schedule: ScheduleEntry[]): ScheduleGroup {
    const grouped: ScheduleGroup = {};

    this.weekDays.forEach(day => {
      grouped[day.value] = [];
    });

    for (const aula of schedule) {
      console.log("Aula:");
      console.dir(aula);
      let key: number; //o dia da semana onde a aula deve ir

      let occurrenceDateStr: string | null = null;

      if (aula.is_recurring) {

        const currentOccurrenceDate = this.getDateForDayOfWeek(aula.day_of_week);
        const dateString = this.datePipe.transform(currentOccurrenceDate, 'yyy-MM-dd');

        if (dateString && aula.excluded_dates && aula.excluded_dates.includes(dateString)) {
          continue;
        }


        //LÓGICA PARA AULAS RECORRENTES
        key = aula.day_of_week;
      } else {
        // LÓGICA PARA AULAS ÚNICAS
        if (!aula.specific_date) {
          console.error("Aula única recebida sem 'specific date'");
          continue;
        }
        const date = new Date(aula.specific_date);
        key = date.getUTCDay();
      }
     
      if (grouped[key] != undefined){
        //aula.status = '';
        grouped[key].push(aula);
      }
    }

    //Ordena as aulas dentro de cada dia pelo horário de início
    for (const day in grouped) {
      grouped[day].sort((a,b) => a.start_time.localeCompare(b.start_time));
    }
    return grouped;
  }


  getDateForDayOfWeek(dayOfWeek: number): Date {
    const date = new Date(this.weekStart);
    date.setDate(date.getDate()+dayOfWeek);
    return date;
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
  async openEditModal(aulaResumida: ScheduleEntry) {
    //Mostra um loading rápido enquanto buscamos os detalhes completos (como os dias da recorrência)
    const loading = await this.loadingCtrl.create({message: 'Carregando detalhes...'});
    await loading.present();

    this.scheduleService.getScheduleById(aulaResumida.id).subscribe({
      next: async (res) => {
        await loading.dismiss();
        const aulaCompleta = res.data;
        console.log("aula Completa no planejamento.page.ts");
        console.dir(aulaCompleta);

        //agora temos 'aulaCompleta' que tem 'recurrente_group_id' e 'active_days'
        const alunos = this.students$.getValue();

        // cálculo da data selecionada
        let selectedDateStr='';
        if (aulaCompleta.is_recurring && aulaCompleta.day_of_week !== null) {
          const dateObj = this.getDateForDayOfWeek(aulaCompleta.day_of_week);
          selectedDateStr = this.datePipe.transform(dateObj, 'yyyy-MM-dd') || '';
        } else if (aulaCompleta.specific_date) {
          selectedDateStr = aulaCompleta.specific_date;
        }

        const modal = await this.modalCtrl.create({
          component: AddAulaModalComponent,
          componentProps: {
            aulaParaEditar: aulaCompleta,
            alunos: alunos,
            alunoSelecionadoId: aulaCompleta.student_id,
            selectedDate: selectedDateStr
          },
          breakpoints: [0, 0.9, 1],
          initialBreakpoint: 0.9,
          cssClass: 'add-aula-modal'
        });

        await modal.present();

        const {data, role} = await modal.onWillDismiss();

        if (role === 'confirm') {
          this.loadSchedule();
        }

      },
      error: async (err) => {
        await loading.dismiss();
        console.error("Erro ao carregar detalhes da aula", err);
      }
    });

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


  //Abre o modal de registro de atividade
  async openRegistrarModal(aula: ScheduleEntry, date: Date) {
    //formata a data para string YYYY-MM-DD para enviar ao backend/model
    const dateStr = this.datePipe.transform(date, 'yyy-MM-dd');

    const modal = await this.modalCtrl.create({
      component: RegistrarAtividadeModalComponent,
      componentProps: {
        aula: aula,
        dataOcorrencia: dateStr
      },
      //Estilo "Sheet" (desliza de baixo)
      breakpoints: [0, 0.75, 0.9],
      initialBreakpoint: 0.75
    });

    await modal.present();

    const {data, role} = await modal.onWillDismiss();
    if (role === 'confirm') {
      this.loadSchedule();
    }
  }

  //Calcula a altura do card baseada na duração da aula
  getCardHeight(start: string, end: string): number {
    if (!start || !end) return 80;

    const toMinutes = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return (hours * 60) + minutes;
    };
    const startMin = toMinutes(start);
    const endMin = toMinutes(end);
    let duration = endMin - startMin;
    
    if (duration < 0) duration += (24*60);
    
    const pixelsPerMinute = 0.8;
    const baseHeight = 10;

    const calculatedHeight = (duration * pixelsPerMinute) + baseHeight;
    return Math.max(calculatedHeight, 90);


  }
}
