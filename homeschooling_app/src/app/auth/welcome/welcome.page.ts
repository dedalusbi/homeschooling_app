import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule, NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { heart, logInOutline, personAddOutline, school, shieldCheckmark, shieldCheckmarkOutline, star, starOutline } from 'ionicons/icons';
import { Config } from 'src/app/services/config';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class WelcomePage implements OnInit {

  constructor(public config: Config, private navCtrl: NavController) {
    addIcons({
      'school': school,
      'person-add-outline': personAddOutline,
      'log-in-outline': logInOutline,
      'shield-checkmark': shieldCheckmark,
      'heart': heart,
      'star': star,
    });
  }

  ngOnInit() {
  }

  goToRegister() {
    this.navCtrl.navigateForward('auth/register');
  }

  goToLogin() {
    this.navCtrl.navigateForward('auth/login');
  }

}
