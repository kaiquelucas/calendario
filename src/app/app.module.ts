import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Marcacoes } from './Model/marcacoes';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class MarcacoesService {
  // base SEM /minhas
  private apiUrl = `${environment.apiBaseUrl}/api/Marcacoes`;

  constructor(private http: HttpClient) {}

  getMinhasMarcacoes(): Observable<Marcacoes[]> {
    return this.http.get<Marcacoes[]>(`${this.apiUrl}/minhas`);
  }

  criarMarcacao(marcacao: any): Observable<Marcacoes> {
    return this.http.post<Marcacoes>(this.apiUrl, marcacao);
  }

  deletarMarcacoes(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  atualizarMarcacoes(id: number, marcacoes: Marcacoes): Observable<Marcacoes> {
    return this.http.put<Marcacoes>(`${this.apiUrl}/${id}`, marcacoes);
  }
}