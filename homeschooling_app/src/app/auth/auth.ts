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
  private apiUrl = environment.apiUrl
  private storageInitialized = false; //Flag para controlar inicialização

  private authState = new BehaviorSubject<boolean>(false); //inicia como não logado
  $isAuthenticated = this.authState.asObservable();

  constructor(private http: HttpClient, private storage: Storage, private navCtrl: NavController) {
    this.initStorage();
  }

  //Função para inicializar o Storage
  async initStorage() {
    //O Storage precisa ser criado antes de ser usado
    await this.storage.create();
    this.storageInitialized = true;
    console.log("Ionic Storage inicializado.");
    //Após iniciar, verificamos o estado inicial de autenticação
    this.checkInitialAuthState();
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
          this.updateAuthState(false);
        }
      })
    );
  }


  //Método para armazenar o token
  async storeToken(token: string): Promise<void> {
    if (!this.storageInitialized) await this.initStorage(); //Garante que o storage esteja inicializado
    //storage.set retorna uma promise
    await this.storage.set(AUTH_TOKEN_KEY, token);
    console.log('Token armazenado: ', token);
  }

  //Método para recuperar o token
  async getToken(): Promise<string | null> {
    if (!this.storageInitialized) await this.initStorage(); //Garante que o storage esteja inicializado
    //storage.get retorna uma Promise com o valor ou null
    const token = await this.storage.get(AUTH_TOKEN_KEY);
    console.log('Token recuperado: ', token);
    return token;
  }

  private updateAuthState(isLoggedIn: boolean) {
    //Emite o novo estado para todos os subscritores
    this.authState.next(isLoggedIn);
    console.log('Estado de autenticação atualizado: ', isLoggedIn);
  }

  //verifica se existe um token no storage quando o serviço inicia
  async checkInitialAuthState() {
    if (!this.storageInitialized) {
      //Se o storage não estiver pronto, aguarda um pouco e tenta de novo
      //Isso evita condições de corrida durante o boot inicial
      setTimeout(() => this.checkInitialAuthState(), 100);
      return;
    }
    const token = await this.getToken();
    //Se encontrou um token, atualiza o estado para 'logado'
    this.updateAuthState(!!token); //!! converte null/undefined para false, string para true
  }

  async logout(): Promise<void> {
    if (!this.storageInitialized) await this.initStorage();
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
}
