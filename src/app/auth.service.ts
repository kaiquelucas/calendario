import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'token';
  private usuarioKey = 'usuarioId';
  private loggedInSubject = new BehaviorSubject<boolean>(!!this.getToken());
  public loggedIn$ = this.loggedInSubject.asObservable();

  constructor(private router: Router, private http: HttpClient) {}

  setToken(token: string, usuarioId?: string | number) {
    localStorage.setItem(this.tokenKey, token);
    if (usuarioId !== undefined) localStorage.setItem(this.usuarioKey, String(usuarioId));
    this.loggedInSubject.next(true);
  }

  getToken(): string | null { return localStorage.getItem(this.tokenKey); }
  getUsuarioId(): string | null { return localStorage.getItem(this.usuarioKey); }

  removeToken() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.usuarioKey);
    this.loggedInSubject.next(false);
  }

  isLoggedIn(): boolean { return !!this.getToken(); }

  logout() {
    this.removeToken();
    this.router.navigate(['/login']);
  }

  logoutServer(): Observable<any> {
    return this.http.post('/api/auth/logout', {}).pipe(
      tap(() => {
        this.removeToken();
        this.router.navigate(['/login']);
      })
    );
  }
}