import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonList, IonTitle, IonToolbar, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmark } from 'ionicons/icons';


interface DescricaoCategoria {
  category: string;
  options: string[];
}


@Component({
  selector: 'app-individualidade-descricao-modal',
  templateUrl: './individualidade-descricao-modal.component.html',
  styleUrls: ['./individualidade-descricao-modal.component.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent,IonList,
    IonItemGroup, IonItemDivider, IonLabel, IonItem, IonIcon, CommonModule
  ],
  standalone: true,
})
export class IndividualidadeDescricaoModalComponent  implements OnInit {

  //Recebe as opções categorizadas e o valor selecionado atualmente do componente
  @Input() options: DescricaoCategoria[] =[];
  @Input() selectedValue: string | null = null;



  constructor(private modalCtrl: ModalController) {
    addIcons({
      'checkmark': checkmark
    });
  }

  ngOnInit() {
    //inicializa as opções filtradas com todas as opçõe
  }


  //Fecha o modal sem retornar dados (cancelar)
  dismissModal() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  //Fecha o modal retornando a opção selecionada
  selectOption(selectedOption: string) {
    this.modalCtrl.dismiss(selectedOption, 'confirm');
  }



}
