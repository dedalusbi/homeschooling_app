import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Config {

  public readonly appName: string = 'EduCasa';

  constructor() {}
  
}
