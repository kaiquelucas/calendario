import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://localhost:5035/api/Usuario';

  constructor(private http: HttpClient) { }

  // Cadastrar usuário (não precisa de token)
  cadastrar(nome: string, email: string, senha: string): Observable<any> {
    return this.http.post(`${this.apiUrl}`, { nome, email, senha });
  }

  // Login
  logar(email: string, senha: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, senha });
  }

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioId');
  }

  // Função para pegar headers com token
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // GET usuários (protegido)
  getUsuarios(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}`, { headers });
  }

  // DELETE usuário (protegido)
  deleteUsuario(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.request('delete', `${this.apiUrl}`, {
      headers,
      body: { id }
    });
  }

  // Exemplo de outro endpoint protegido
  atualizarUsuario(id: number, dados: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(`${this.apiUrl}/${id}`, dados, { headers });
  }
}
