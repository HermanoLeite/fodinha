import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from "@angular/forms";

import { NgModule } from '@angular/core';

import { Router } from './router';

import { environment } from '../environments/environment';

import { StorageService } from './service/storage.service';
import { CartaService } from './service/carta.service';
import { JogadorService } from './service/jogador.service';
import { JogoService } from './service/jogo.service';


import { AppComponent } from './components/index/app.component';
import { JogadorComponent } from './components/jogador';
import { JogoComponent } from './components/jogo';
import { JogoInitComponent } from './components/jogo-init';

import { CartaComponent } from './components/jogo/components/carta/carta.component';
import { CriarJogoComponent } from './components/jogo-init/components/criar-jogo/criar-jogo.component';
import { ListarJogosComponent } from './components/jogo-init/components/listar-jogos/listar-jogos.component';
import { ListarJogadoresComponent } from './components/jogador/components/listar-jogadores/listar-jogadores.component';
import { CriarJogadorComponent } from './components/jogador/components/criar-jogador/criar-jogador.component';
import { ToggleVisaoCartaComponent } from './components/jogo/components/toggle-visao-carta/toggle-visao-carta.component';
import { PlacarJogoComponent } from './components/jogo/components/placar-jogo/placar-jogo.component';
import { PlacarRodadaComponent } from './components/jogo/components/placar-rodada/placar-rodada.component';
import { JogadasComponent } from './components/jogo/components/jogadas/jogadas.component';
import { GanhadorComponent } from './components/jogo/components/ganhador/ganhador.component';
import { BotaoComecarComponent } from './components/jogo/components/botao-comecar/botao-comecar.component';
import { BotaoPalpiteComponent } from './components/jogo/components/botao-palpite/botao-palpite.component';
import { MaoJogadorComponent } from './components/jogo/components/mao-jogador/mao-jogador.component';
import { BotaoComecarJogoComponent } from './components/jogador/components/botao-comecar-jogo/botao-comecar-jogo.component';
import { PageHeaderComponent } from './components/index/components/page-header/page-header';
import { StorageServiceModule } from 'angular-webstorage-service';
import { FirebaseService } from './service/firebase.service';

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
    MaoJogadorComponent,
    PageHeaderComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    Router,
    AngularFireAuthModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireStorageModule,
    StorageServiceModule,
  ],
  providers: [JogoService, JogadorService, CartaService, StorageService, FirebaseService],
  bootstrap: [AppComponent]
})
export class AppModule { }
