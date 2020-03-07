import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from "@angular/forms";

import { AppRoutingModule } from './app-routing.module';

import { CookieService } from 'ngx-cookie-service';

import { environment } from '../environments/environment';

import { AppComponent } from './containers/index/app.component';
import { JogadorComponent } from './containers/jogador/jogador.component';
import { JogoComponent } from './containers/jogo/jogo.component';
import { JogoInitComponent } from './containers/jogo-init/jogo-init.component';

import { JogadorService } from './service/jogador.service';
import { JogoService } from './service/jogo.service';
import { JogadaComponent } from './components/jogada/jogada.component';
import { RodadaComponent } from './components/rodada/rodada.component';
import { CartaComponent } from './components/cartas/carta.component';
import { RodadaService } from './components/rodada/rodada.service';
import { CriarJogoComponent } from './components/jogo/criar-jogo/criar-jogo.component';
import { ListarJogosComponent } from './components/jogo/listar-jogos/listar-jogos.component';
import { ListarJogadoresComponent } from './components/jogador/listar-jogadores/listar-jogadores.component';
import { CriarJogadorComponent } from './components/jogador/criar-jogador/criar-jogador.component';
import { VisaoCartaComponent } from './components/cartas/visao-carta/visao-carta.component';
import { PlacarJogoComponent } from './components/jogo/placar/placar-jogo/placar-jogo.component';
import { PlacarRodadaComponent } from './components/jogo/placar/placar-rodada/placar-rodada.component';

@NgModule({
  declarations: [
    AppComponent,
    JogoComponent,
    JogadorComponent,
    RodadaComponent,
    JogadaComponent,
    CartaComponent,
    JogoInitComponent,
    CriarJogoComponent,
    ListarJogosComponent,
    ListarJogadoresComponent,
    CriarJogadorComponent,
    VisaoCartaComponent,
    PlacarJogoComponent,
    PlacarRodadaComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    BrowserAnimationsModule,
  ],
  providers: [JogoService, JogadorService, RodadaService, CookieService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
