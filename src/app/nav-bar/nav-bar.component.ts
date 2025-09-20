import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit, OnDestroy {
  usuarioLogado = false;
  private sub!: Subscription;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    // subscribe para atualizar quando o usuário logar/sair
    this.sub = this.auth.loggedIn$.subscribe(logged => {
      this.usuarioLogado = logged;
    });
  }

  logout(): void {
    // usa o logout local; se quiser falar com o servidor use auth.logoutServer().subscribe(...)
    this.auth.logout();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}