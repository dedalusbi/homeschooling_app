import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient){}

  //Inicia uma sessão de checkout no Stripe.
  createCheckoutSession(planKey: string): Observable<{url: string}> {
    return this.http.post<{url: string}>(
      `${this.apiUrl}/subscriptions/checkout`, {
        plan: planKey
      }
    );
  }
  
}
