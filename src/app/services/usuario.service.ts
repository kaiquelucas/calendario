import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiUrl = `${environment.apiBaseUrl}/api/Usuario`;

  constructor(private http: HttpClient) {}

  // ---- helpers ----
  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  // ---- públicos ----
  cadastrar(nome: string, email: string, senha: string): Observable<any> {
    return this.http.post(`${this.apiUrl}`, { nome, email, senha });
  }

  logar(email: string, senha: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, senha });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioId');
  }

  getUsuarios(): Observable<any> {
    return this.http.get(`${this.apiUrl}`, { headers: this.authHeaders() });
  }

  deleteUsuario(id: number): Observable<any> {
    // Se seu backend espera DELETE com body, troque por:
    // return this.http.request('delete', `${this.apiUrl}`, { headers: this.authHeaders(), body: { id } });
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.authHeaders() });
  }

  atualizarUsuario(id: number, dados: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, dados, { headers: this.authHeaders() });
  }
}
