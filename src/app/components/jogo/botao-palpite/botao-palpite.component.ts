import { Component, Input } from '@angular/core';
import { Etapa } from 'src/app/containers/jogo/jogo.status';
import { AngularFirestoreDocument } from '@angular/fire/firestore';

@Component({
  selector: 'botao-palpite',
  templateUrl: './botao-palpite.component.html',
})
export class BotaoPalpiteComponent {
  @Input() etapa : Etapa;
  @Input() rodadaDoc: AngularFirestoreDocument;
  @Input() jogador: any;
  @Input() rodada: any;
  constructor() { 
    console.log("-------------- construindo botao palpite");
  }
  
  etapaPalpite() {
    return this.etapa === Etapa.palpite;
  }
  
  palpite(palpite: number) : void {
    const jogadorDoc = this.rodadaDoc.collection("jogadores").doc(this.jogador.id.toString());
    jogadorDoc.update({ palpite: palpite });
    
    const proximoJogador = this.proximoJogador();

    if (this.rodada.comeca === this.rodada.vez) {
      this.criarJogada(proximoJogador)
      this.rodadaDoc.update({ etapa: Etapa.jogarCarta, vez: proximoJogador });
    }
    else {
      this.rodadaDoc.update({ vez: proximoJogador });
    }
  }

  proximoJogador() : number {
    const vez = this.rodada.vez + 1;
    return vez === this.rodada.jogadoresCount ? 0 : vez;
  }

  criarJogada(jogadorComeca) : void {
    const jogadaCollection = this.rodadaDoc.collection("jogada");

    const jogada = {
      comeca: jogadorComeca,
      maiorCarta: null,
    }

    jogadaCollection.add(jogada).then(function(docRef) {
      this.rodadaDoc.update({ jogadaAtual: docRef.id, vez: jogadorComeca });
    }.bind(this))
    .catch(function(error) {
      console.error("Error adding document: ", error);
    });
  }
}
