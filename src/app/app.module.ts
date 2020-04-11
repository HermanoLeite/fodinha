import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from "@angular/forms";

import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';

import { environment } from '../environments/environment';

import { LocalStorageService } from './service/local-storage';
import { CartaService } from './service/carta.service';
import { JogadorService } from './service/jogador.service';
import { JogoService } from './service/jogo.service';


import { AppComponent } from './containers/index/app.component';
import { JogadorComponent } from './containers/jogador';
import { JogoComponent } from './containers/jogo/jogo.component';
import { JogoInitComponent } from './containers/jogo-init';

import { CartaComponent } from './containers/jogo/components/carta/carta.component';
import { CriarJogoComponent } from './containers/jogo-init/components/criar-jogo/criar-jogo.component';
import { ListarJogosComponent } from './containers/jogo-init/components/listar-jogos/listar-jogos.component';
import { ListarJogadoresComponent } from './containers/jogador/components/listar-jogadores/listar-jogadores.component';
import { CriarJogadorComponent } from './containers/jogador/components/criar-jogador/criar-jogador.component';
import { ToggleVisaoCartaComponent } from './containers/jogo/components/toggle-visao-carta/toggle-visao-carta.component';
import { PlacarJogoComponent } from './containers/jogo/components/placar/placar-jogo/placar-jogo.component';
import { PlacarRodadaComponent } from './containers/jogo/components/placar/placar-rodada/placar-rodada.component';
import { JogadasComponent } from './containers/jogo/components/jogadas/jogadas.component';
import { GanhadorComponent } from './containers/jogo/components/ganhador/ganhador.component';
import { BotaoComecarComponent } from './containers/jogo/components/botao-comecar/botao-comecar.component';
import { BotaoPalpiteComponent } from './containers/jogo/components/botao-palpite/botao-palpite.component';
import { MaoJogadorComponent } from './containers/jogo/components/mao-jogador/mao-jogador.component';
import { BotaoComecarJogoComponent } from './containers/jogador/components/botao-comecar-jogo/botao-comecar-jogo.component';
import { PageHeaderComponent } from './containers/index/components/page-header/page-header';
import { StorageServiceModule } from 'angular-webstorage-service';

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
    AppRoutingModule,
    AngularFireAuthModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireStorageModule,
    StorageServiceModule
  ],
  providers: [JogoService, JogadorService, CartaService, LocalStorageService],
  bootstrap: [AppComponent]
})
export class AppModule { }
