import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';

// Tipagem do item retornado pela Nager.Date (padrão)
interface HolidayItem {
  date: string;       // "YYYY-MM-DD"
  localName: string;
  name: string;
  countryCode: string;
  // ... outros campos que a API retorna
}

@Injectable({ providedIn: 'root' })
export class HolidayService {
  // ideal: mover para environment.ts
  private nagerBase = 'https://date.nager.at/api/v3/PublicHolidays';

  private portugalStatic = [
    '01-01', '04-25', '05-01', '06-10', '08-15',
    '10-05', '11-01', '12-01', '12-08', '12-25'
  ];

  // cache por chave "year-country"
  private cache = new Map<string, Observable<string[]>>();

  constructor(private http: HttpClient) {}

  // retorna array de strings ISO "YYYY-MM-DD"
  getPublicHolidays(year: number, countryCode = 'PT'): Observable<string[]> {
    const key = `${year}-${countryCode}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const url = `${this.nagerBase}/${year}/${countryCode}`;
    const obs = this.http.get<HolidayItem[]>(url).pipe(
      map(list => list.map(i => i.date)), // já YYYY-MM-DD
      catchError(err => {
        console.warn('HolidayService: falha ao buscar Nager.Date, fallback -> []', err);
        return of([] as string[]);
      }),
      // mantém resultado em memória para múltiplas assinaturas
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.cache.set(key, obs);
    return obs;
  }

  // fallback estático gerado para o ano no formato YYYY-MM-DD
  getPortugalStaticForYear(year: number): string[] {
    return this.portugalStatic.map(mmdd => `${year}-${mmdd}`);
  }

  // Combina API + fallback (API tem prioridade; fallback acrescenta se faltar)
  getHolidaysWithFallback(year: number, countryCode = 'PT'): Observable<string[]> {
    return new Observable<string[]>(subscriber => {
      this.getPublicHolidays(year, countryCode).subscribe({
        next: (apiDates) => {
          let result = apiDates ?? [];
          if (!result || result.length === 0) {
            // se API falhou ou respondeu vazio, retorna fallback
            result = this.getPortugalStaticForYear(year);
          } else {
            // garantir que fallback dates também estejam presentes (opcional)
            const fallback = this.getPortugalStaticForYear(year);
            const set = new Set(result);
            fallback.forEach(d => set.add(d));
            result = Array.from(set).sort();
          }
          subscriber.next(result);
          subscriber.complete();
        },
        error: (err) => {
          // fallback extremo
          subscriber.next(this.getPortugalStaticForYear(year));
          subscriber.complete();
        }
      });
    });
  }

  // utilitário rápido: verifica se uma data é feriado
  // aceita Date ou "YYYY-MM-DD" (se passar Date, converte)
  isHoliday(date: Date | string, year?: number, countryCode = 'PT'): Observable<boolean> {
    const dateStr = typeof date === 'string' ? date : this.toIso(date);
    const y = year ?? (typeof date === 'string' ? Number(date.slice(0,4)) : date.getFullYear());
    return this.getHolidaysWithFallback(y, countryCode).pipe(
      map(list => new Set(list).has(dateStr))
    );
  }

  // helper para converter Date => YYYY-MM-DD
  private toIso(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }
}