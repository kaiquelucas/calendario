import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Marcacoes } from './Model/marcacoes';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class MarcacoesService {
  private apiUrl = `${environment.apiBaseUrl}/api/Marcacoes`;

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  getMinhasMarcacoes(): Observable<Marcacoes[]> {
    return this.http.get<Marcacoes[]>(`${this.apiUrl}/minhas`, { headers: this.authHeaders() });
  }

  criarMarcacao(marcacao: any): Observable<Marcacoes> {
    return this.http.post<Marcacoes>(this.apiUrl, marcacao, { headers: this.authHeaders() });
  }

  deletarMarcacoes(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.authHeaders() });
  }

  atualizarMarcacoes(id: number, marcacoes: Marcacoes): Observable<Marcacoes> {
    return this.http.put<Marcacoes>(`${this.apiUrl}/${id}`, marcacoes, { headers: this.authHeaders() });
  }
}
