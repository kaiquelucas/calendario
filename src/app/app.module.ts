import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { MainComponent } from './main/main.component';
import { LoginComponent } from './login/login.component';
import { CadastroComponent } from './login/cadastro/cadastro.component';

// se você tem estes componentes, mantenha; se não tiver, remova das declarations:
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { FooterComponent } from './footer/footer.component';

import { AuthGuard } from './auth.guard';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    LoginComponent,
    CadastroComponent,
    NavBarComponent,
    FooterComponent
    // NÃO declare MarcacoesComponent aqui
  ],
  imports: [
    BrowserModule,       // disponibiliza 'titlecase' (via CommonModule)
    FormsModule,         // habilita [(ngModel)]
    RouterModule,        // garante routerLink/router-outlet nos templates
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    AuthService,
    AuthGuard,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}