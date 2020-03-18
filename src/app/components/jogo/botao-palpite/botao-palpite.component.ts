import { Component, Input } from '@angular/core';
import { Etapa } from 'src/app/containers/jogo/jogo.status';
import { AngularFirestoreDocument } from '@angular/fire/firestore';

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
  constructor() {
    console.log("-------------- construindo botao palpite");
  }

  etapaPalpite() {
    return this.etapa === Etapa.palpite;
  }

  palpite(palpite: number): void {
    const jogadorDoc = this.rodadaDoc.collection("jogadores").doc(this.jogador.id.toString());
    jogadorDoc.update({ palpite: palpite });

    const proximoJogador = this.proximoJogador();

    if (this.rodada.comeca === this.rodada.vez) {
      this.criarJogada(proximoJogador, this.rodadaDoc)
      this.rodadaDoc.update({ etapa: Etapa.jogarCarta, vez: proximoJogador });
    }
    else {
      this.rodadaDoc.update({ vez: proximoJogador });
    }
  }

  proximoJogador(): number {
    const vez = this.rodada.vez + 1;
    return vez === this.rodada.jogadoresCount ? 0 : vez;
  }
}
