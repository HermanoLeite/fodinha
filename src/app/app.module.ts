import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from "@angular/forms";

import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';

import { CookieService } from 'ngx-cookie-service';

import { environment } from '../environments/environment';

import { AppComponent } from './containers/index/app.component';
import { JogadorComponent } from './containers/jogador/jogador.component';
import { JogoComponent } from './containers/jogo/jogo.component';
import { JogoInitComponent } from './containers/jogo-init/jogo-init.component';

import { CartaService } from './service/carta.service';
import { JogadorService } from './service/jogador.service';
import { JogoService } from './service/jogo.service';
import { CartaComponent } from './components/cartas/carta/carta.component';
import { CriarJogoComponent } from './components/jogo/criar-jogo/criar-jogo.component';
import { ListarJogosComponent } from './components/jogo/listar-jogos/listar-jogos.component';
import { ListarJogadoresComponent } from './components/jogador/listar-jogadores/listar-jogadores.component';
import { CriarJogadorComponent } from './components/jogador/criar-jogador/criar-jogador.component';
import { ToggleVisaoCartaComponent } from './components/cartas/toggle-visao-carta/toggle-visao-carta.component';
import { PlacarJogoComponent } from './components/jogo/placar/placar-jogo/placar-jogo.component';
import { PlacarRodadaComponent } from './components/jogo/placar/placar-rodada/placar-rodada.component';
import { JogadasComponent } from './components/jogo/jogadas/jogadas.component';
import { GanhadorComponent } from './components/jogo/ganhador/ganhador.component';
import { BotaoComecarComponent } from './components/jogo/botao-comecar/botao-comecar.component';
import { BotaoPalpiteComponent } from './components/jogo/botao-palpite/botao-palpite.component';
import { MaoJogadorComponent } from './components/jogo/mao-jogador/mao-jogador.component';
import { BotaoComecarJogoComponent } from './components/jogador/botao-comecar-jogo/botao-comecar-jogo.component';

@NgModule({
  declarations: [
    AppComponent,
    BotaoComecarComponent,
    JogoComponent,
    JogadorComponent,
    CartaComponent,
    JogoInitComponent,
    CriarJogoComponent,
    ListarJogosComponent,
    ListarJogadoresComponent,
    CriarJogadorComponent,
    ToggleVisaoCartaComponent,
    PlacarJogoComponent,
    PlacarRodadaComponent,
    JogadasComponent,
    GanhadorComponent,
    BotaoComecarJogoComponent,
    BotaoComecarComponent,
    BotaoPalpiteComponent,
    MaoJogadorComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    AngularFireAuthModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireStorageModule,
    BrowserAnimationsModule,
  ],
  providers: [JogoService, JogadorService, CartaService, CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
