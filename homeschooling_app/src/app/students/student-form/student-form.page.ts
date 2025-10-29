import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertController, IonBackButton, IonButton, IonButtons, IonContent, IonDatetime, IonDatetimeButton, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonModal, IonSelect, IonSelectOption, IonSpinner, IonTitle, IonToolbar, LoadingController, ModalController, NavController } from '@ionic/angular/standalone';
import { StudentService } from '../student.service';
import { ActivatedRoute } from '@angular/router';
import { group } from '@angular/animations';
import { addIcons } from 'ionicons';
import { addCircle, calendar, camera, caretDown, person, removeCircle, save } from 'ionicons/icons';
import { IndividualidadeDescricaoModalComponent } from '../components/individualidade-descricao-modal/individualidade-descricao-modal.component';

//interface para a nova estrutura das opções da descrição
interface DescricaoCategoria {
  category: string;
  options: string[];
}

@Component({
  selector: 'app-student-form',
  templateUrl: './student-form.page.html',
  styleUrls: ['./student-form.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,
    ReactiveFormsModule, IonButtons, IonBackButton, IonIcon, IonLabel, IonInput,
    IonDatetimeButton, IonModal, IonDatetime, IonButton, IonSelect, IonSelectOption,
    IonSpinner, IonItem
  ]
})
export class StudentFormPage implements OnInit {

  studentForm: FormGroup;
  pageTitle = 'Adicionar aluno';
  studentId: string | null = null; //Para saber se estamos em modo de edição
  isLoading = false; //Para loading inicial (edição)

  //Definição das opções para os dropdowns
  readonly caracteristicaOptions: string[]=[
    'Interesse',
    'Dificuldade de Aprendizagem',
    'Talento/Habilidade',
    'Estilo de Aprendizagem',
    'Traço de personalidade/Temperamento',
    'Condição Médica/Desenvolvimento',
    'Necessidade Específica'
  ];
  readonly descricaoOptionsMap: {[key: string]: DescricaoCategoria[]} = {
    'Interesse':[
      { category: 'Acadêmicos Gerais', options: ['Leitura (Ficção, Não-Ficção)', 'Escrita Criativa', 'História (Geral, Antiga, Brasil)', 'Geografia', 
    'Ciências (Biologia, Química, Física)', 'Astronomia/Espaço', 'Matemática/Lógica', 'Filosofia']},
      { category: 'Artes & Música', options: ['Música (Ouvir, Tocar Instrumento, Canto)', 'Artes Visuais (Desenho, Pintura, Escultura)', 
    'Artes Cênicas (Teatro, Dança)', 'Fotografia/Cinema', 'Design Gráfico',]},
      { category: 'Tecnologia & Engenharia', options: ['Programação/Codificação', 'Robótica', 'Eletrônica', 'Videogames (Desenvolvimento, Jogar)', 
    'Construção (LEGO, Modelismo)', 'Engenharia/Mecânica',]},
      { category: 'Natureza & Mundo Físico', options: ['Natureza/Ecologia', 'Animais (Geral, Específico)', 'Jardinagem/Agricultura', 'Geologia/Minerais',
    'Culinária/Gastronomia',]},
      { category: 'Esportes & Movimento', options: ['Desporto (Geral, Específico)', 'Atividades ao Ar Livre (Trilha, Escalada)', 'Yoga/Mindfulness',]},
      { category: 'Outros', options: ['Culturas Mundiais/Línguas Estrangeiras', 'Mitologia', 'Política/Cívica', 'Empreendedorismo', 
    'Trabalho Voluntário', 'Jogos de Tabuleiro/Estratégia', 'Moda/Costura', 'Marcenaria']},
    ],
    'Dificuldade de Aprendizagem':[
      { category: 'Acadêmicas Específicas', options: ['Leitura (Decodificação, Fluência)', 'Compreensão de Leitura', 'Escrita (Ortografia, Gramática, Caligrafia)', 
    'Expressão Escrita (Organização de Ideias)', 'Matemática (Cálculo, Raciocínio Lógico)', 
    'Memorização (Curto Prazo, Longo Prazo)', 'Linguagem Oral (Expressão, Compreensão)',]},
      { category: 'Funções Executivas & Atenção', options: ['Concentração/Manutenção da Atenção', 'Organização (Material, Tarefas)', 'Planejamento/Sequenciamento', 
    'Iniciação de Tarefas/Procrastinação', 'Gerenciamento do Tempo', 'Controle Inibitório/Impulsividade', 
    'Flexibilidade Cognitiva (Mudar de tarefa)', 'Memória de Trabalho',]},
      { category: 'Motoras & Sensoriais', options: ['Coordenação Motora Fina', 'Coordenação Motora Grossa', 'Processamento Sensorial (Hipo/Hipersensibilidade)',
    'Processamento Auditivo', 'Processamento Visual',]},
      { category: 'Socioemocionais', options: ['Socialização/Interação com Pares', 'Regulação Emocional', 'Ansiedade (Geral, Social, de Desempenho)', 
    'Motivação Intrínseca', 'Resiliência/Lidar com Frustração', 'Comunicação Não-Verbal']},
      
    ],
    'Talento/Habilidade':[
      { category: 'Intelectuais & Acadêmicas', options: ['Raciocínio Lógico-Matemático Avançado', 'Pensamento Crítico/Analítico', 'Resolução de Problemas Complexos', 
    'Memória Excepcional', 'Facilidade com Línguas/Poliglota', 'Curiosidade Intelectual Aguçada',
    'Habilidade de Pesquisa/Autodidatismo', 'Pensamento Criativo/Originalidade',]},
      { category: 'Artísticas & Expressivas', options: ['Musicalidade (Instrumento, Canto, Composição)', 'Habilidade Artística (Desenho, Pintura, Escultura)', 
    'Escrita Criativa/Narrativa', 'Atuação/Performance Teatral', 'Dança/Expressão Corporal',]},
      { category: 'Técnicas & Práticas', options: ['Habilidade Tecnológica/Programação', 'Raciocínio Espacial/Visualização 3D', 'Habilidade Mecânica/Engenharia', 
    'Destreza Manual/Trabalhos Manuais', 'Pensamento Estratégico (Jogos, Planejamento)',]},
      { category: 'Físicas', options: ['Habilidade Atlética/Coordenação Motora', 'Resistência Física', 'Flexibilidade/Agilidade',]},
      { category: 'Interpessoais & Intrapessoais', options: ['Liderança', 'Empatia/Inteligência Emocional', 'Comunicação Efetiva/Oratória', 
    'Habilidade de Mediação/Persuasão', 'Introspecção/Autoconhecimento', 'Foco/Concentração Profunda']},
      
    ],
    'Estilo de Aprendizagem':[
      { category: 'Modalidades Sensoriais (VARK/Fleming)', options: ['Visual (Gráficos, Imagens, Vídeos)', 'Auditivo (Ouvir, Explicar, Debater)', 
    'Leitor/Escritor (Ler, Escrever, Anotar)', 'Cinestésico (Fazer, Tocar, Movimentar, Experimentar)',]},
      { category: 'Preferências de Processamento (Gardner/Outros)', options: ['Lógico-Matemático (Estrutura, Sequência)', 'Linguístico (Palavras, Linguagem)', 
    'Espacial (Visualizar, Mapas Mentais)', 'Musical (Ritmos, Melodias)', 
    'Interpessoal (Aprende em Grupo, Interação)', 'Intrapessoal (Aprende Sozinho, Reflexão)', 
    'Naturalista (Observar Natureza, Classificar)', 'Existencial (Grandes Questões)',]},
      { category: 'Preferências de Abordagem', options: ['Prefere Projetos Práticos', 'Gosta de Aulas Expositivas/Estruturadas', 'Aprendizagem Baseada em Jogos', 
    'Aprendizagem por Descoberta', 'Necessita de Instrução Direta e Explícita', 'Aprende Melhor com Rotina',
    'Aprende Melhor com Flexibilidade', 'Ritmo de Aprendizagem (Rápido, Moderado, Lento)', 
    'Prefere Abordagem Sequencial', 'Prefere Abordagem Global/Holística']},
      
    ],
    'Traço de personalidade/Temperamento':[
      { category: 'Extroversão/Introversão', options: ['Extrovertido', 'Introvertido', 'Ambivertido',]},
      { category: 'Reação a Estímulos/Novidade', options: ['Sensível/Reativo', 'Intenso', 'Calmo/Tranquilo', 'Adaptável', 'Cauteloso/Hesitante', 
    'Curioso/Explorador', 'Impulsivo',]},
      { category: 'Abordagem a Tarefas', options: ['Persistente', 'Distraído Facilmente', 'Focado', 'Perfeccionista', 'Pragmático', 
    'Detalhista', 'Visão Geral ("Big Picture")', 'Organizado', 'Flexível/Espontâneo',]},
      { category: 'Estilo Social', options: ['Colaborativo', 'Competitivo', 'Independente', 'Líder', 'Seguidor', 'Assertivo', 'Reservado',]},
      { category: 'Estilo Emocional', options: ['Otimista', 'Pessimista/Realista', 'Expressivo Emocionalmente', 'Contido Emocionalmente',
    'Empático', 'Resiliente']},
      
    ],
    'Condição Médica/Desenvolvimento':[
      { category: 'Neurodesenvolvimento', options: ['TDAH (Transtorno do Déficit de Atenção com Hiperatividade)', 'TEA (Transtorno do Espectro Autista)', 
    'Dislexia', 'Discalculia', 'Disgrafia', 'Deficiência Intelectual (DI)', 
    'Transtorno do Processamento Sensorial (TPS)', 'Dispraxia/Transtorno do D. da Coordenação (TDC)', 
    'Altas Habilidades/Superdotação (AH/SD)', 'Síndrome de Tourette', 'Transtorno Opositivo Desafiador (TOD)',]},
      { category: 'Saúde Mental', options: ['Ansiedade (Generalizada, Social, Separação)', 'Depressão', 'TOC (Transtorno Obsessivo-Compulsivo)', 
    'Transtornos Alimentares', 'Estresse Pós-Traumático (TEPT)',]},
      { category: 'Saúde Física Crônica', options: ['Asma', 'Alergias (Alimentares, Respiratórias, Outras)', 'Diabetes (Tipo 1, Tipo 2)', 
    'Epilepsia', 'Doenças Autoimunes', 'Fibrose Cística', 'Cardiopatias', 'Doenças Raras',]},
      { category: 'Deficiências Sensoriais/Motoras', options: ['Deficiência Visual (Baixa Visão, Cegueira)', 'Deficiência Auditiva (Perda Leve a Profunda)', 
    'Deficiência Física/Mobilidade Reduzida',]},
      { category: 'Outros', options: ['Dificuldades de Fala/Linguagem (Atraso, Transtorno)', 'Distúrbios do Sono', 'Enxaqueca Crônica',
    'Outra (Requer Especificação)']},
      
    ],
    'Necessidade Específica':[
      { category: 'Suporte Pedagógico', options: ['Acompanhamento Psicopedagógico', 'Reforço Escolar Específico (Matéria)', 
    'Adaptações Curriculares/Materiais', 'Tecnologia Assistiva (Software, Hardware)',
    'Plano de Ensino Individualizado (PEI)',]},
      { category: 'Suporte Terapêutico', options: ['Terapia Psicológica/Psicoterapia', 'Terapia Ocupacional (TO)', 'Fonoaudiologia/Terapia da Fala', 
    'Fisioterapia', 'Acompanhamento Terapêutico (AT)', 'Intervenção Precoce',]},
      { category: 'Ambiente & Rotina', options: ['Ambiente de Estudo Estruturado/Silencioso', 'Rotina Previsível e Consistente', 
    'Necessidade de Pausas Frequentes/Movimento', 'Flexibilidade de Horários/Ritmo',
    'Adaptações de Acessibilidade Física',]},
      { category: 'Saúde & Bem-Estar', options: ['Dieta Específica (Restrições, Necessidades Nutricionais)', 'Acompanhamento Médico Regular', 
    'Gerenciamento de Medicação',]},
      { category: 'Social & Emocional', options: ['Suporte para Regulação Emocional', 'Treinamento de Habilidades Sociais', 
    'Oportunidades de Socialização (Estruturadas, Livres)', 'Mediação Familiar/Escolar']},
      
    ],
  };

  //Armazena um arrau de opções de descrição para cada linha
  descricaoOptionsForRow: DescricaoCategoria[][] =[];

  get individualitiesFormArray() { return this.studentForm.get('individualities') as FormArray;}
  get f() {return this.studentForm.controls;}

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private route: ActivatedRoute,
    private location: Location,
    private modalCtrl: ModalController
  ) {

    addIcons({
      'camera': camera,
      'calendar': calendar,
      'add-circle': addCircle,
      'person': person,
      'remove-circle': removeCircle,
      'save': save,
      'caret-down': caretDown
    });
    this.studentForm = this.fb.group({
      name: ['', [Validators.required]],
      birth_date: [null],
      grade_level: [null],
      individualities: this.fb.array([])
    });

  }

  ngOnInit() {
    this.studentId = this.route.snapshot.paramMap.get('id');
    if (this.studentId) {
      this.pageTitle = 'Editar aluno';
      this.loadStudentData(this.studentId);
    } else {
      this.pageTitle = 'Adicionar aluno';
    }
  }

  // -- Carregamento de dados para edição (Exemplo) ---
  async loadStudentData(id: string) {
    this.isLoading=true;
    const loading = await this.loadingCtrl.create({message: 'Carregando dados...'});
    await loading.present();

    this.studentService.getStudentById(id).subscribe({
      next: async (res) => {
        const studentData = res.data;

        // Pré-processa a data para o formato ISO que ion-datetime aceita
        let birthDateForForm = null;
        if (studentData.birth_date) {
          try {
            birthDateForForm = new Date(studentData.birth_date+'T00:00:00').toISOString();
          } catch (e) { console.error("erro ao converter data para edição:",e)}
        }
        this.studentForm.patchValue({
          name: studentData.name,
          birth_date: birthDateForForm,
          grade_level: studentData.grade_level
        });
        //Limpa o Form Array antes de adicionar os itens existentes
        this.individualitiesFormArray.clear();
        //Adiciona um FormGroup ao formArray para cada individualidade existente
        if (studentData.individualities && Array.isArray(studentData.individualities)) {
          studentData.individualities.forEach(ind => {
            this.individualitiesFormArray.push(
              this.createIndividualidadeGroup(ind.type, ind.description)
            );
          });
        }
        this.isLoading=false;
        await loading.dismiss();
      },
      error: async (err) => {
        console.error("Erro ao carregar aluno para edição", err);
        this.isLoading = false;
        await loading.dismiss();
        await this.presentAlert('Erro', 'Não foi possível carregar os dados do aluno.');
        this.navCtrl.navigateBack('/tabs/alunos');
      }
    });
  }


  // --- Métodos para gerir o FormArray 'individualities' ---
  //Cria um formgroup para uma linha, opcionalmente com valores iniciais (para edição)
  createIndividualidadeGroup(type: string | null = null, description: string | null = null): FormGroup {
    return this.fb.group({
      type: [type, Validators.required],
      description: [description, Validators.required]
    });
  }

  //Adiciona uma novalinha vazia ao FormArray
  addIndividualidade(): void {
    const individualidadeGroup = this.createIndividualidadeGroup();
    this.individualitiesFormArray.push(individualidadeGroup);
    // REMOVIDA a subscrição valueChanges e a manipulação de descricaoOptionsForRow
  }



  //Remove uma linha do FormArray pelo índice
  removeIndividualidade(index: number): void {
    this.individualitiesFormArray.removeAt(index);
  }

  //Retorna as opções de descrição estruturadas para um índice específico
  getDescricaoOptions(index: number): DescricaoCategoria[] {
    const selectedType = this.individualitiesFormArray.at(index)?.get('type')?.value;
    // Adiciona log para depuração
    // console.log(`getDescricaoOptions para linha ${index}, tipo: ${selectedType}`, this.descricaoOptionsMap[selectedType] || []);
    return this.descricaoOptionsMap[selectedType] || [];
  }


  async onSubmit() {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      this.individualitiesFormArray.controls.forEach(group => group.markAllAsTouched());
      return;
    }

    const loading = await this.loadingCtrl.create({message: 'Salvando...'});
    await loading.present();
  
    //prepara os dados do formulário
    const formData = this.studentForm.getRawValue();

    //Formata a data (se existir)
    if (formData.birth_date) {
      try {
        formData.birth_date = new Date(formData.birth_date).toISOString().split('T')[0];
      } catch (e) {
        formData.birth_date = null;
      }
    } else {
      formData.birth_date = null;
    }

    //Garante que individualities sejsa um array(pode ser null se nunca adicionado)
    formData.individualities = formData.individualities || [];

    console.log('Dados a enviar:', formData);

    //Lógica pra criar ou atualizar
    if (this.studentId) {
      
      //LÓGICA DE ATUALIZAÇÃO

      this.studentService.updateStudent(this.studentId, formData).subscribe({
        next: async (res) => {
          await loading.dismiss();
          await this.presentAlert('Sucesso', 'Aluno atualizado com sucesso!');
          this.location.back();
        },
        error: async (err) => {
          await loading.dismiss();
          console.error('Erro ao atualizar aluno:',err);
          let errorMessage = 'Não foi possível atualizar o aluno.';
          if (err.status === 404) {errorMessage = 'Aluno não encontrado.';}
          else if (err.error?.errors) {errorMessage=Object.values(err.error.errors).flat().join(' '); }
          await this.presentAlert('Erro', errorMessage);

        }
      });

    } else {
      //LÓGICA DE CRIAÇÃO
      this.studentService.createStudent(formData).subscribe({
        next: async (res) => {
          await loading.dismiss();
          await this.presentAlert('Sucesso', 'Aluno adicionado com sucesso.');
          this.navCtrl.navigateBack('/tabs/alunos'); //Volta para a lista
        },
        error: async (err) => {
          await loading.dismiss();
          let errorMessage ='Não foi possível adicionar o aluno.';
          if (err.status === 403) {errorMessage = 'Você atingiu o limite de alunos para o seu plano.';}
          else if (err.error?.errors) {errorMessage = Object.values(err.error.errors).flat().join(' ');}
          await this.presentAlert('Erro', errorMessage);
        }
      });
    }
  }

  //Placeholder para atualizar a fto..
  changeStudentPhoto() {
    console.log('Abrir seltor de foto...')
  }


  async presentAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({header, message, buttons: ['OK']});
    await alert.present();
  }


  async openDescricaoModal(index: number) {

    //obtém o Formgroup específico para esta linha no formArray
    const individualidadeGroup = this.individualitiesFormArray.at(index) as FormGroup;
    if (!individualidadeGroup) return; //segurança

    const optionsParaModal = this.getDescricaoOptions(index);
    const valorAtual = individualidadeGroup.get('description')?.value;

    //Cria e apresenta o modal
    const modal = await this.modalCtrl.create({
      component: IndividualidadeDescricaoModalComponent,
      componentProps: {
        options: optionsParaModal,
        selectedValue: valorAtual
      },
      breakpoints: [0, 0.5, 0.8],
      initialBreakpoint: 0.8 
    });

    await modal.present();

    const {data, role} = await modal.onWillDismiss();

    if (role ==='confirm' && data) {
      individualidadeGroup.get('description')?.setValue(data);
      individualidadeGroup.get('description')?.markAllAsDirty();
      individualidadeGroup.get('description')?.markAsTouched();
      console.log(`Descrição selecionada para linha ${index}:`, data)
    } else {
      console.log(`Modal fechado sem confirmação para linha ${index}.`)
    }

  }

}

