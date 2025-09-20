import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.css']
  
})
export class CadastroComponent {
  nome = '';
  email = '';
  senha = '';
  mensagem = '';

  constructor(private usuarioService: UsuarioService, private router: Router) {}

 cadastrarUsuario(event: Event) {
  event.preventDefault(); // previne reload
  this.usuarioService.cadastrar(this.nome, this.email, this.senha)
    .subscribe({
      next: () => {
        // cadastrado com sucesso, já loga
        this.usuarioService.logar(this.email, this.senha)
          .subscribe({
            next: (res: any) => {
              localStorage.setItem('token', res.token);
              localStorage.setItem('usuarioId', res.usuarioId);
              this.router.navigate(['/main']); // vai direto para main
            },
            error: () => this.mensagem = 'Erro ao logar automaticamente'
          });
      },
      error: (err) => this.mensagem = 'Erro ao cadastrar: ' + err.message
    });
}
}