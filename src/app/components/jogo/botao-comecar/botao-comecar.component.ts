import { Component, Input } from '@angular/core';
import { Baralho } from '../../../models/baralho';
import { Etapa } from 'src/app/containers/jogo/jogo.status';
import { AngularFirestoreDocument } from '@angular/fire/firestore';

import { BotaoComecarController } from './botao-comecar.controller';

@Component({
  selector: 'botao-comecar',
  templateUrl: './botao-comecar.component.html',
})
export class BotaoComecarComponent {
  baralho: Baralho;
  controller;
  @Input() jogadorVez: number;
  @Input() etapa: Etapa;
  @Input() rodadaDoc: AngularFirestoreDocument;
  @Input() quantidadeDeJogadores: number;
  @Input() rodada: number;

  constructor() {
    console.log("------- construindo botao começar");
  }

  etapaEmbaralhar() {
    this.controller = new BotaoComecarController(this.rodadaDoc, this.jogadorVez, this.quantidadeDeJogadores, this.rodada);
    return this.etapa === Etapa.embaralhar;
  }

  comecar() {
    this.controller.comecar();
  }
}
