import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiUrl = `${environment.apiBaseUrl}/api/Usuario`;

  constructor(private http: HttpClient) {}

  cadastrar(nome: string, email: string, senha: string): Observable<any> {
    return this.http.post(`${this.apiUrl}`, { nome, email, senha });
  }

  logar(email: string, senha: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, senha }).pipe(
      tap(res => {
        if (res?.token) localStorage.setItem('token', res.token);
        if (res?.usuarioId != null) localStorage.setItem('usuarioId', String(res.usuarioId));
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioId');
  }

  getUsuarios(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  deleteUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  atualizarUsuario(id: number, dados: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, dados);
  }
}