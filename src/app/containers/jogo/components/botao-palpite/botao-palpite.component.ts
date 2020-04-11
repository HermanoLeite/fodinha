import { Component, Input } from '@angular/core';
import { Etapa } from 'src/app/containers/jogo/jogo.status';
import { AngularFirestoreDocument } from '@angular/fire/firestore';

import { BotaoPalpiteController } from './botao-palpite.controller';

@Component({
  selector: 'botao-palpite',
  templateUrl: './botao-palpite.component.html',
})
export class BotaoPalpiteComponent {
  @Input() etapa: Etapa;
  @Input() rodadaDoc: AngularFirestoreDocument;
  @Input() jogador: any;
  @Input() rodada: any;
  @Input() criarJogada: Function;

  etapaPalpite() {
    return this.etapa === Etapa.palpite;
  }

  palpite(palpite: number): void {
    let botaoController =
      new BotaoPalpiteController(this.rodadaDoc, this.rodada, this.criarJogada, this.jogador);

    botaoController.palpite(palpite);
  }
}
