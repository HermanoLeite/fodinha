import { Component, Input } from '@angular/core';
import { Etapa } from 'src/app/components/jogo/jogo.status';
import { AngularFirestoreDocument } from '@angular/fire/firestore';
import { JogoService } from 'src/app/service/jogo.service';

@Component({
  selector: 'mao-jogador',
  templateUrl: './mao-jogador.component.html'
})
export class MaoJogadorComponent {

  @Input() rodada: any;
  @Input() jogador: any;
  @Input() jogada: any;
  @Input() jogo: any;
  @Input() rodadaDoc: AngularFirestoreDocument;
  @Input() jogoDoc: AngularFirestoreDocument;
  @Input() criarJogada: Function;
  jogando: Boolean;
  constructor(private jogoService: JogoService) {
  }

  etapaJogarCarta() {
    return this.rodada.etapa === Etapa.jogarCarta;
  }

  proximoJogador(rodadaVez: number, jogadoresCount: number): number {
    const vez = rodadaVez + 1;
    return vez === jogadoresCount ? 0 : vez;
  }

  async jogarCarta(cartaJogadorIndex) {
    if (this.jogando) {
      return;
    }
    this.jogando = true;
    var carta = this.jogador.cartas.splice(cartaJogadorIndex, 1).pop();
    var vencedor = this.jogoService.realizarJogada(carta, this.jogador, this.jogada, this.rodada, this.rodadaDoc);
    var proximoJogador = this.proximoJogador(this.rodada.vez, this.rodada.jogadoresCount);
    
    if (proximoJogador === this.jogada.comeca) {
      await this.jogoService.atualizaQuemFezJogada(this.rodadaDoc, vencedor);

      if (this.jogador.cartas.length !== 0) {
        this.comecarNovaJogada(vencedor, this.jogada.comeca)
      }
      else {
        this.jogoService.encerrarJogada(this.jogo.id, this.rodada.id, this.jogoDoc, this.jogo.rodada);
      }
    }
    else {
      this.rodadaDoc.update({ vez: proximoJogador });
    }
    
    this.jogando = false;
  }

  comecarNovaJogada(maiorCartaJogador, jogadorComecouJogada) {
    if (maiorCartaJogador !== null) {
      this.criarJogada(maiorCartaJogador, this.rodadaDoc);
      this.rodadaDoc.update({ vez: maiorCartaJogador });
    }
    else {
      this.criarJogada(jogadorComecouJogada, this.rodadaDoc);
      this.rodadaDoc.update({ vez: jogadorComecouJogada });
    }
  }
}
