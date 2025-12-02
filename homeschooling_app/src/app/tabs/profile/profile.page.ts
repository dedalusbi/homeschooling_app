import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonTitle, IonToolbar, LoadingController, NavController } from '@ionic/angular/standalone';
import { User } from 'src/app/models/user.model';
import { Auth } from 'src/app/auth/auth';
import { addIcons } from 'ionicons';
import { create, diamond, documentText, download, logOut, person, settings, statsChart } from 'ionicons/icons';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonButton, IonIcon,
    IonItem, IonLabel
  ]
})
export class ProfilePage implements OnInit {

  user: User | null = null;

  constructor(
    private authService: Auth,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController
  ) {
    addIcons({
      person, create, diamond, documentText, statsChart, download, settings, logOut
    });
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  ionViewWillEnter() {
    this.loadUserProfile();
  }

  async loadUserProfile() {
    this.authService.getProfile().subscribe({
      next: (res) => {
        this.user = res.data;
      },
      error: (err) => console.error("Erro ao carregar perfil", err)
    });
  }

  manageSubscription() {
    if (!this.user) return;
    
    this.navCtrl.navigateForward('/plans');
    
  }

  async logout() {
    await this.authService.logout();
  }

}
