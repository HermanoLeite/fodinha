import { Component, Input } from '@angular/core';
import { Carta, combate } from '../../cartas/carta';
import { Etapa, Status } from 'src/app/containers/jogo/jogo.status';
import { AngularFirestoreDocument } from '@angular/fire/firestore';
import { JogoService } from 'src/app/service/jogo.service';

@Component({
  selector: 'mao-jogador',
  templateUrl: './mao-jogador.component.html'
})
export class MaoJogadorComponent {

  @Input() cartas: Array<Carta>;
  @Input() rodada: any;
  @Input() jogador: any;
  @Input() jogada: any;
  @Input() jogo: any;
  @Input() etapa: Etapa;
  @Input() manilha: Carta;
  @Input() rodadaDoc: AngularFirestoreDocument;
  @Input() jogoDoc: AngularFirestoreDocument;
  @Input() criarJogada: Function;
  jogando: Boolean;
  constructor(private jogoService: JogoService) {
    console.log('--------- construindo cartas mão');
  }
  
  etapaJogarCarta () {
    return this.etapa === Etapa.jogarCarta;
  }
  
  proximoJogador(rodadaVez: number, jogadoresCount: number) : number {
    const vez = rodadaVez+1;
    return vez === jogadoresCount ? 0 : vez;
  }

  async jogarCarta(cartaJogadorIndex) {
    if (this.jogando) {
      return;
    }
    this.jogando = true;
    var carta = this.cartas.splice(cartaJogadorIndex, 1).pop();
    var vencedor = this.realizarJogada(carta);

    var proximoJogador = this.proximoJogador(this.rodada.vez, this.rodada.jogadoresCount);
    if (proximoJogador === this.jogada.comeca) {
      await this.jogoService.atualizaQuemFezJogada(this.rodadaDoc, vencedor);
      
      if (this.jogador.cartas.length !== 0) {
        this.comecarNovaJogada(vencedor, this.jogada.comeca)
      }
      else {
        this.encerrarJogada();
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

  realizarJogada(carta: Carta) {
    const jogadorDoc = this.rodadaDoc.collection("jogadores").doc(this.jogador.id.toString());
    const jogadaDoc = this.rodadaDoc.collection("jogada").doc(this.rodada.jogadaAtual);
    const jogadasCollection = jogadaDoc.collection("jogadas");
    
    const cartaCombate = carta.combate(Carta.fromString(this.jogada.maiorCarta), this.manilha);
    
    jogadasCollection.add( { jogador: this.jogador.nome, ...carta, jogadorId: this.jogador.id });
    jogadorDoc.update({ cartas: this.jogador.cartas.map(carta => JSON.stringify(carta)) });

    if (cartaCombate === combate.ganhou) {
      jogadaDoc.update({ maiorCarta: JSON.stringify(carta), maiorCartaJogador: this.jogador.id });
      return this.jogador.id
    }

    if (cartaCombate === combate.empate) {
      jogadaDoc.update({ maiorCartaJogador: null });
      return null
    }

    return this.jogada.maiorCartaJogador;
  }

  async encerrarJogada() {
    var jogadoresVidasPerdidas = await this.jogoService.jogadoresVidasPerdidas(this.jogo.id, this.rodada.id);
    await this.jogoService.atualizaJogadorVida(this.jogoDoc, jogadoresVidasPerdidas);
    var jogadoresProximaRodada = await this.jogoService.jogadoresProximaRodada(this.jogo.id);

    if (this.jogoService.seJogoFinalizado(jogadoresProximaRodada)) {
      this.encerrarJogo(jogadoresProximaRodada);
    }
    else {
      this.jogoService.criarRodada(jogadoresProximaRodada, this.jogo.id, this.jogo.rodada+1);
    }
  }

  async encerrarJogo(jogadoresProximaRodada) {
    if(this.jogoService.seJogoEmpatado(jogadoresProximaRodada)) {
      this.jogoDoc.update({status: Status.finalizado});
    }
    else {
      this.jogoDoc.update({status: Status.finalizado, vencedor: jogadoresProximaRodada[0].nome});
    }
  }
}
