import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { FormsModule } from "@angular/forms";
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { StorageServiceModule } from 'angular-webstorage-service';


import { Router } from './router';

import { environment } from '../environments/environment';

import { FirebaseService } from './services/firebase.service';
import { StorageService } from './services/storage.service';

import { ChatController } from './controllers/chat.controller';
import { JogadorController } from './controllers/jogador.controller';
import { JogoController } from './controllers/jogo.controller';

import { AppComponent } from './app.component';
import { JogadorComponent } from './containers/jogador';
import { JogoComponent } from './containers/jogo';
import { JogoInitComponent } from './containers/jogo-init';
import { ChatComponent } from './containers/chat';

import { CartaComponent } from './containers/jogo/components/carta/carta.component';
import { ListarJogosComponent } from './containers/jogo-init/components/listar-jogos/listar-jogos.component';
import { ListarJogadoresComponent } from './containers/jogador/components/listar-jogadores/listar-jogadores.component';
import { CriarJogadorComponent } from './containers/jogador/components/criar-jogador/criar-jogador.component';
import { ToggleVisaoCartaComponent } from './containers/jogo/components/toggle-visao-carta/toggle-visao-carta.component';
import { PlacarRodadaComponent } from './containers/jogo/components/placar-rodada/placar-rodada.component';
import { JogadasComponent } from './containers/jogo/components/jogadas/jogadas.component';
import { GanhadorComponent } from './containers/jogo/components/ganhador/ganhador.component';
import { BotaoComecarComponent } from './containers/jogo/components/botao-comecar/botao-comecar.component';
import { BotaoPalpiteComponent } from './containers/jogo/components/botao-palpite/botao-palpite.component';
import { MaoJogadorComponent } from './containers/jogo/components/mao-jogador/mao-jogador.component';
import { BotaoComecarJogoComponent } from './containers/jogador/components/botao-comecar-jogo/botao-comecar-jogo.component';
import { JogoCardComponent } from './containers/jogo-init/components/jogo-card/jogo-card.component';
import { JogoHeaderComponent } from './components/header/jogo-header.component';
import { JogoInitHeaderComponent } from './components/header/jogo-init-header.component';
import { PageComponent } from './components/page/page.component';

@NgModule({
  declarations: [
    AppComponent,
    BotaoComecarComponent,
    JogoHeaderComponent,
    JogoInitHeaderComponent,
    PageComponent,
    ChatComponent,
    JogoComponent,
    JogadorComponent,
    CartaComponent,
    JogoInitComponent,
    JogoCardComponent,
    ListarJogosComponent,
    ListarJogadoresComponent,
    CriarJogadorComponent,
    ToggleVisaoCartaComponent,
    PlacarRodadaComponent,
    JogadasComponent,
    GanhadorComponent,
    BotaoComecarJogoComponent,
    BotaoComecarComponent,
    BotaoPalpiteComponent,
    MaoJogadorComponent,
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
  providers: [ChatController, JogoController, JogadorController, StorageService, FirebaseService],
  bootstrap: [AppComponent]
})
export class AppModule { }
