import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

//Definindo uma chave constante para o token (boa prática)
const AUTH_TOKEN_KEY = 'authToken';

@Injectable({
  providedIn: 'root'
})

export class Auth {

  //URL da API definida nos arquivos environment
  private apiUrl = environment.apiUrl;
  private _storage: Storage | null = null;
  private authState = new BehaviorSubject<boolean>(false); //inicia como não logado
  $isAuthenticated = this.authState.asObservable();

  private initialCheckDone = new BehaviorSubject<boolean>(false);
  $initialCheckDone = this.initialCheckDone.asObservable();

  constructor(private http: HttpClient, private storage: Storage, private navCtrl: NavController) {
    this.initializeAuth();
  }


  private async initializeAuth(): Promise<void> {
    await this.initStorage(); //Espera o storage iniciar
    await this.checkInitialAuthState(); //ESPERA a verificação inicial terminar
    this.initialCheckDone.next(true);
    console.log('Auth Service: Inicialização completa.');
  }

  //Função para inicializar o Storage
  private async initStorage(): Promise<void> {
    if (this._storage) {return;}
    try {
      const storage = await this.storage.create();
      this._storage = storage;
      console.log("Ionic storage inicializado");
    } catch (error) {
      console.error("erro ao inicializar Ionic Storage: ", error);
    }
    
  }


  //Garante que temos a instância do storage pronta
  private async getStorage(): Promise<Storage> {
    if (!this._storage){
      await this.initStorage();
    }
    if (!this._storage) {
      throw new Error("Storage não pode ser inicializado.");
    }
    return this._storage;
  }

  register(fullName: string, email: string, password: string) {
    const userData = {
      user: {
        full_name: fullName,
        email: email,
        password: password
      }
    };
    return this.http.post(`${this.apiUrl}/users/register`, userData);
  }


  login(email: string, password: string) {
    const credentials = {
      user: {
        email: email, 
        password: password
      }
    };

    return this.http.post<{token: string}>(`${this.apiUrl}/users/login`, credentials).pipe(
      tap(async response => { //usamos async aqui por causa do storage.net
        if (response.token) {
          await this.storeToken(response.token); //Chama o método para guardar o token
          //Após guardar o token, atualizamos o estado de autenticação
          this.updateAuthState(true);
        } else {
          //Caso a API retorne sucesso mas sem token (improvável)
          console.error('Resposta de login inválida:', response);
          this.updateAuthState(false);
        }
      })
    );
  }


  //Método para armazenar o token
  async storeToken(token: string): Promise<void> {
    const storage = await this.getStorage();
    //storage.set retorna uma promise
    await storage.set(AUTH_TOKEN_KEY, token);
    console.log('Token armazenado: ', token);
  }

  //Método para recuperar o token
  async getToken(): Promise<string | null> {
    const storage = await this.getStorage();
    //storage.get retorna uma Promise com o valor ou null
    const token = await storage.get(AUTH_TOKEN_KEY);
    console.log('Token recuperado: ', token);
    return token;
  }

  private updateAuthState(isLoggedIn: boolean) {
    //Emite o novo estado para todos os subscritores
    this.authState.next(isLoggedIn);
    console.log('Estado de autenticação atualizado: ', isLoggedIn);
  }

  //verifica se existe um token no storage quando o serviço inicia
  async checkInitialAuthState(): Promise<void> {
    const token = await this.getToken();
    console.log('checkInitialAuthState - Token recuperado: ', token);
    //Se encontrou um token, atualiza o estado para 'logado'
    this.updateAuthState(!!token); //!! converte null/undefined para false, string para true
    console.log(`checkInitialAuthState - Estado atualizado para: ${!!token}`);
  }

  async logout(): Promise<void> {

    const storage = await this.getStorage();
    
    //Remove o token do Ionic Storage
    await this.storage.remove(AUTH_TOKEN_KEY);
    //Atualiza o estado de autenticação para não logado
    this.updateAuthState(false);
    //Redireciona o usuário para a página de login (ou boas-vindas)
    //MapsRoot limpa o histórico de navegação
    this.navCtrl.navigateRoot('/auth/login', {animated: true, animationDirection: 'back'})
    console.log('Usuário deslogado');
  }  

  isLoggedIn(): boolean {
    return this.authState.getValue();
  }

  //Solicita um link de recuperação de senha para o email fornecido
  requestPasswordReset(email: string) {
    return this.http.post<{message: string}>(`${this.apiUrl}/users/request_password_reset`, {email});
  }

  //Envia o token de reset e a nova senha para o backend
  resetPassword(token:string, password: string, confirm_password: string) {
    const payload = {token, password, confirm_password};
    return this.http.post<{message: string}>(`${this.apiUrl}/users/reset_password`, payload);
  }

  resendVerificationLink(email: string) {
    return this.http.post<{message: string}>(`${this.apiUrl}/users/resend_verification`, { email });
  }

  verifyEmail(token: string) {
    // Assumindo endpoint POST /api/users/verify com { token: "..." }
    return this.http.post<{message: string}>(`${this.apiUrl}/users/verify`, { token });
  }

}
