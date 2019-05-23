import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from '../environments/environment';
import { JogoComponent } from './jogo/jogo.component';
import { JogoService } from './jogo/jogo.service';
import { JogadorComponent } from './jogador/jogador.component';
import { JogadorService } from './jogador/jogador.service';
import { RodadaComponent } from './rodada/rodada.component';
import { RodadaService } from './rodada/rodada.service';

import { FormsModule } from "@angular/forms";

import { CookieService } from 'ngx-cookie-service';
import { JogadaComponent } from './jogada/jogada.component';
import { JogoInitComponent } from './jogo-init/jogo-init.component';
import { CartaComponent } from './cartas/carta.component';

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
