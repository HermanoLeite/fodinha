import { Component, Input } from '@angular/core';
import { Baralho } from '../../cartas/baralho';
import { Etapa } from 'src/app/containers/jogo/jogo.status';
import { AngularFirestoreDocument } from '@angular/fire/firestore';

@Component({
  selector: 'botao-comecar',
  templateUrl: './botao-comecar.component.html',
})
export class BotaoComecarComponent {
  baralho : Baralho;

  @Input() jogadorVez: number;
  @Input() etapa: Etapa;
  @Input() rodadaDoc: AngularFirestoreDocument;
  @Input() quantidadeDeJogadores: number;
  @Input() rodada: number;

  constructor() { 
    console.log("------- construindo botao começar");
  }
  
  etapaEmbaralhar() {
    return this.etapa === Etapa.embaralhar;
  }

  comecar() {
    this.embaralhar();
    this.tirarManilha();
    this.distribuir();
  }

  embaralhar() {
    this.baralho = new Baralho();
    this.baralho.embaralhar();
  }

  tirarManilha() {
    var manilha = this.baralho.tirarVira();
    this.atualizarManilha(manilha);
  }

  distribuir() {
    var quantidadeCartas = this.quantidadeDeCartas(this.baralho.quantidadeCartasTotal(), this.quantidadeDeJogadores, this.rodada);
    
    for (var i = 0; i < this.quantidadeDeJogadores; i++) {
      const cartaArray = this.baralho.tiraCartas(quantidadeCartas);
      const cartaArrayJSON = cartaArray.map(carta => JSON.stringify(carta));

      this.entregarCarta(i.toString(), cartaArrayJSON)
    }

    this.atualizarRodada();
  }

  quantidadeDeCartas(qtdCartasTotal: number, jogadoresCount: number, rodada: number) : number {
    var qtdCartasMax = qtdCartasTotal-1/jogadoresCount;
    if (rodada < qtdCartasMax) {
      return rodada+1;
    }
    var sobe = (rodada/qtdCartasMax) % 2 === 0;
    if (sobe) {
      return (rodada % qtdCartasMax) + 1
    }
    return (qtdCartasMax*(rodada/qtdCartasMax))-rodada;
  }

  atualizarManilha(manilha) {
    this.rodadaDoc.update({manilha: JSON.stringify(manilha)});
  }

  entregarCarta(jogador, cartaArrayJSON) {
    this.rodadaDoc.collection("jogadores")
                  .doc(jogador)
                  .update({cartas: cartaArrayJSON});
  }

  atualizarRodada() : void {
    var proximoJogador = this.jogadorVez + 1;
    if (proximoJogador === this.quantidadeDeJogadores) {
      proximoJogador = 0;
    }
    this.rodadaDoc.update({ etapa: Etapa.palpite, vez: proximoJogador });
  }
}
