import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { jwtDecode } from 'jwt-decode';
import { User } from '../models/user.model';

//Definindo uma chave constante para o token (boa prática)
const AUTH_TOKEN_KEY = 'authToken';

interface JwtPayload {
  sub: string; //ID do usuário
  exp: number; //data de expiração
}


@Injectable({
  providedIn: 'root'
})

export class Auth {

  private _currentUserId: string | null = null;

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

  public get currentUserId(): string | null {
    return this._currentUserId;
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
          this.updateAuthState(true, response.token);
        } else {
          //Caso a API retorne sucesso mas sem token (improvável)
          console.error('Resposta de login inválida:', response);
          this.updateAuthState(false, null);
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

  private updateAuthState(isLoggedIn: boolean, token: string | null) {
    //Emite o novo estado para todos os subscritores

    if (isLoggedIn && token) {
      try {
        const decodedToken: JwtPayload = jwtDecode(token);

        if (Date.now() >= decodedToken.exp*1000) {
          console.log("Token expirado encontrado, tratando como deslogado.");
          this.updateAuthState(false, null);
          return;
        }

        //Armazena o ID do usário
        this._currentUserId = decodedToken.sub;
        this.authState.next(true);
        console.log('Estado de autenticação atualizado: true, UserID:', this._currentUserId);
      } catch(error) {
        console.error("Erro ao decodificar token, tratando como deslogado:",error);
        this._currentUserId = null;
        this.authState.next(false);
      }

    } else {
      this._currentUserId = null;
      this.authState.next(false);
      console.log('Estado de autenticação autalizado: false');
    }

  }

  //verifica se existe um token no storage quando o serviço inicia
  async checkInitialAuthState(): Promise<void> {

    const token = await this.getToken();
    console.log('checkInitialAuthState - Token recuperado: ', token);
    //Se encontrou um token, atualiza o estado para 'logado'
    this.updateAuthState(!!token, token); //!! converte null/undefined para false, string para true
    console.log(`checkInitialAuthState - Estado atualizado para: ${!!token}`);
  }

  async logout(): Promise<void> {

    const storage = await this.getStorage();
    
    //Remove o token do Ionic Storage
    await storage.remove(AUTH_TOKEN_KEY);
    //Atualiza o estado de autenticação para não logado
    this.updateAuthState(false, null);
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

  getProfile() {
    return this.http.get<{data: User}>(`${this.apiUrl}/me?t=${new Date().getTime()}`);
  }

}
