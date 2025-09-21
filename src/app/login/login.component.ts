import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';
import { AuthService } from '../auth.service'; 
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  senha = '';
  mensagem = '';
  mostrarCadastro = false;

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private authService: AuthService
  ) {}

  abrirCadastro() { this.mostrarCadastro = true; }
  fecharCadastro() { this.mostrarCadastro = false; }

  logarUsuario(event?: Event) {
    event?.preventDefault();
    this.usuarioService.logar(this.email, this.senha).subscribe({
      next: (res: any) => {
        const token = res.token ?? res.Token;
        const usuarioId = res.usuarioId ?? res.UsuarioId;
        if (token) {
          this.authService.setToken(token, usuarioId);
          this.router.navigate(['/main']); // << garanta a rota
        } else {
          this.mensagem = 'Resposta inválida do servidor';
        }
      },
      error: (err) => {
        console.error(err);
        this.mensagem = 'Email ou senha incorretos!';
      }
    });
  }
}