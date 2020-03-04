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

import { JogadorService } from './containers/jogador/jogador.service';
import { JogoService } from './containers/jogo/jogo.service';

import { JogadaComponent } from './components/jogada/jogada.component';
import { RodadaComponent } from './components/rodada/rodada.component';
import { CartaComponent } from './components/cartas/carta.component';
import { RodadaService } from './components/rodada/rodada.service';

@NgModule({
  declarations: [
    AppComponent,
    JogoComponent,
    JogadorComponent,
    RodadaComponent,
    JogadaComponent,
    CartaComponent,
    JogoInitComponent
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
