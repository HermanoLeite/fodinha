import { AngularFirestore } from '@angular/fire/firestore';
import { Router, ActivatedRoute } from '@angular/router';
import { Component } from '@angular/core';

import { Jogador } from './jogador.model';
import { JogadorService } from '../../service/jogador.service';
import { Jogo } from '../jogo/jogo.model';

@Component({
  selector: 'jogador',
  templateUrl: './jogador.component.html'
})

export class JogadorComponent {
  
  constructor() {
     
  }
}