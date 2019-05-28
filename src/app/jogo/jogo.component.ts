import { JogoService } from './jogo.service';
import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { config } from '../collection.config';
import { Status, Etapa } from './jogo.status';
import { Jogo } from './jogo.model';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument  } from '@angular/fire/firestore';
import { Baralho } from '../cartas/baralho'
import { Carta, combate } from '../cartas/carta'
import { Jogada } from '../jogada/jogada.model'

@Component({
  selector: 'app-jogo',
  templateUrl: './jogo.component.html',
  styleUrls: ['./jogo.component.css']
})
export class JogoComponent implements OnInit {
  jogo:any;
  jogadores: any;
  jogadoresJogo: any;
  rodada: any;
  jogadorJogandoId: any;
  jogadorJogando: any;
  baralho: Baralho;
  jogada: any = null;
  jogadas: any = null;
  todosPalpitaram: boolean = false;
  jogoDoc: AngularFirestoreDocument<any>;
  rodadaDoc: AngularFirestoreDocument<any>;
  Etapa: Etapa;
  visaoCarta: boolean = true;
  jogando: boolean = false;

  constructor(private db: AngularFirestore, private jogoService: JogoService, private router: Router, private route: ActivatedRoute) { 
    this.jogoDoc = this.db.collection(config.jogoDB).doc(this.route.snapshot.paramMap.get("id"));
    this.visaoCarta = this.jogoService.getVisaoCarta();
  }

  async jogarCarta(cartaJogadorIndex) {
    if (this.jogando) {
      return;
    }
    this.jogando = true;
    var carta = this.jogadorJogando.cartas.splice(cartaJogadorIndex, 1).pop();
    this.realizarJogada(carta);

    if (this.proximoJogador() === this.jogada.comeca) {
      await this.jogoService.atualizaQuemFezJogada(this.rodadaDoc, this.jogada.maiorCartaJogador);
      
      if (this.jogadorJogando.cartas.length !== 0) {
        this.comecarNovaJogada(this.jogada.maiorCartaJogador, this.jogada.comeca)
      }
      else {
        this.encerrarJogada();
      }
    }
    else {
      this.atualizarRodada();
    }
    this.jogando = false;
  }

  comecarNovaJogada(maiorCartaJogador, jogadorComecouJogada) {
    if (maiorCartaJogador !== null) {
      this.criarJogada(maiorCartaJogador);
      this.atualizarRodada(null, maiorCartaJogador);
    }
    else {
      this.criarJogada(jogadorComecouJogada);
      this.atualizarRodada(null, jogadorComecouJogada);
    }
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

  realizarJogada(carta: Carta) {
    const jogadorDoc = this.rodadaDoc.collection("jogadores").doc(this.jogadorJogando.id.toString());
    const jogadaDoc = this.rodadaDoc.collection("jogada").doc(this.rodada.jogadaAtual);
    const jogadasCollection = jogadaDoc.collection("jogadas");
    
    const cartaCombate = carta.combate(Carta.fromString(this.jogada.maiorCarta), this.rodada.manilha);
    
    if (cartaCombate === combate.ganhou) {
      this.jogada.maiorCartaJogador = this.jogadorJogando.id;
      jogadaDoc.update({ maiorCarta: JSON.stringify(carta), maiorCartaJogador: this.jogada.maiorCartaJogador });
    }

    if (cartaCombate === combate.empate) {
      this.jogada.maiorCartaJogador = null;
      jogadaDoc.update({ maiorCartaJogador: this.jogada.maiorCartaJogador });
    }

    jogadasCollection.add( { jogador: this.jogadorJogando.nome, ...carta, jogadorId: this.jogadorJogando.id });
    jogadorDoc.update({ cartas: this.jogadorJogando.cartas.map(carta => JSON.stringify(carta)) });
  }

  toggleVisaoCarta() {
    this.visaoCarta = !this.visaoCarta;
    this.jogoService.setVisaoCarta(this.visaoCarta);
  }

  jogoFinalizado() : boolean {
    if (this.jogo)
      return this.jogo.status === Status.finalizado;
    
    return false;
  }

  etapaEmbaralhar(etapa) {
    return etapa === Etapa.embaralhar;
  }

  etapaPalpite(etapa) {
    return etapa === Etapa.palpite;
  }

  etapaJogarCarta(etapa) {
    return etapa === Etapa.jogarCarta;
  }
  
  comecar() {
    this.jogada = null;
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

  atualizarManilha(manilha) {
    this.rodadaDoc.update({manilha: JSON.stringify(manilha)});
  }
  
  distribuir() {
    var query = this.jogoDoc;
    var quantidadeCartas = this.quantidadeDeCartas(this.baralho.quantidadeCartasTotal(), this.rodada.jogadoresCount, this.jogo.rodada);

    for (var i = 0; i < this.rodada.jogadoresCount; i++) {
      var cartaArray = this.baralho.tiraCartas(quantidadeCartas)
      query.collection(config.rodadaDB).doc(this.jogo.rodada.toString()).collection("jogadores").doc(i.toString()).update({cartas: cartaArray.map(carta => JSON.stringify(carta))});
    }
    this.atualizarRodada(Etapa.palpite);
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

  palpite(palpite: number) {
    const jogadorDoc = this.rodadaDoc.collection("jogadores").doc(this.jogadorJogando.id.toString());
    jogadorDoc.update({ palpite: palpite });
    
    if (this.proximoJogador() === this.proximoJogador(this.rodada.comeca)) {
      this.criarJogada(this.proximoJogador())
      this.atualizarRodada(Etapa.jogarCarta);
    }
    this.atualizarRodada();
  }

  criarJogada(jogadorComeca) {
    const rodadaDoc = this.jogoDoc.collection(config.rodadaDB).doc(this.rodada.id);
    const jogadaCollection = rodadaDoc.collection("jogada");

    const jogada = {
      comeca: jogadorComeca,
      maiorCarta: null,
    }

    jogadaCollection.add(jogada).then(function(docRef) {
      rodadaDoc.update({ jogadaAtual: docRef.id, vez: jogadorComeca });
    }.bind(this))
    .catch(function(error) {
      console.error("Error adding document: ", error);
    });
  }
  
  proximoJogador(jogadorVez: number = null) {
    const vez = jogadorVez === null ?  this.rodada.vez+1 : jogadorVez+1 ;
    return vez === this.rodada.jogadoresCount ? 0 : vez;
  }

  atualizarRodada(rodadaEtapa: number = null, jogadorVez: number = null) {
    var query = this.jogoDoc;
    var rodadaQuery = query.collection(config.rodadaDB).doc(this.rodada.id);
    const rodadaVez = jogadorVez === null ? this.proximoJogador() : jogadorVez;

    if (rodadaEtapa) {
      if (rodadaEtapa === Etapa.jogarCarta) {
        rodadaQuery.update({ etapa: rodadaEtapa });
      }
      else {
        rodadaQuery.update({ etapa: rodadaEtapa, vez: rodadaVez });
      }
    }
    else {
      rodadaQuery.update({ vez: rodadaVez });
    }
  }

  loadRodada(rodadaId) {
    this.jogadoresJogo = this.jogoDoc.collection(config.jogadorDB).snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      }),
    );

    this.rodadaDoc = this.jogoDoc.collection(config.rodadaDB).doc(rodadaId);
    this.rodadaDoc.snapshotChanges().pipe(
      map(a => {
        const data : any = a.payload.data();
        const id = a.payload.id;
        if (data.manilha) data.manilha = Carta.fromString(data.manilha);
        if (data.jogadaAtual) {
          const jogadaQuery = this.rodadaDoc.collection("jogada").doc(data.jogadaAtual);
          
          jogadaQuery.snapshotChanges().pipe(map(a => {
            const data = a.payload.data() as Jogada;
            if (data.maiorCarta) data.maiorCartaObj = Carta.fromString(data.maiorCarta);
            const id = a.payload.id;
            return { id, ...data };
          })).subscribe(jogada => this.jogada = jogada);

          jogadaQuery.collection("jogadas").snapshotChanges().pipe(
            map(actions => {
              return actions.map(a => {
                const data = a.payload.doc.data();
                const id = parseInt(a.payload.doc.id, 10);
                return { id, ...data };
              });
            }),
          ).subscribe(jogadas => this.jogadas = jogadas);
        } 
        return { id, ...data };
      })
    ).subscribe(rodada => this.rodada = rodada)

    this.jogadores = this.jogoDoc.collection(config.rodadaDB).doc(rodadaId).collection("jogadores").snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = parseInt(a.payload.doc.id, 10);

          if (data.cartas) {
            data.cartas = data.cartas.map(carta => {
              let cartaObj = Carta.fromString(carta);
              return cartaObj; 
            });
          }

          if (data.jogadorId === this.jogadorJogandoId) {
            this.jogadorJogando = { id, ...data };
          }
          return { id, ...data };
        });
      }),
    );
  }

  ngOnInit() {
    this.jogadorJogandoId = this.jogoService.jogadorCriado();

    this.jogoDoc.snapshotChanges().pipe(
      map(a => {
        const data = a.payload.data() as Jogo;
        const id = a.payload.id;
          this.loadRodada(data.rodada.toString());
        return { id, ...data };
      })
    ).subscribe(jogo => this.jogo = jogo);  
  }
}