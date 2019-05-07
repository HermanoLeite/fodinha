import { JogoService } from './jogo.service';
import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { config } from '../collection.config';
import { Status, Etapa } from './jogo.status';
import { Jogo } from './jogo.model';
import { AngularFirestore } from '@angular/fire/firestore';
import { Baralho } from '../cartas/baralho'
import { Carta, combate } from '../cartas/carta'

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
  status = Status;
  etapa = Etapa;
  baralho: Baralho;
  jogada: any = null;
  jogadas: any = null;
  todosPalpitaram: boolean = false;

  constructor(private db: AngularFirestore, private jogoService: JogoService, private router: Router, private route: ActivatedRoute) { 
  }

  jogarCarta(cartaJogadorIndex) {
    var carta = this.jogadorJogando.cartas.splice(cartaJogadorIndex, 1).pop();
    
    const rodadaQuery = this.db.collection(config.jogoDB).doc(this.route.snapshot.paramMap.get("id")).collection(config.rodadaDB).doc(this.rodada.id);
    const jogadorQuery = rodadaQuery.collection("jogadores").doc(this.jogadorJogando.id.toString());
    const jogadaQuery = rodadaQuery.collection("jogada").doc(this.rodada.jogadaAtual);
    
    const cartaCombate = carta.combate(Carta.fromString(this.jogada.maiorCarta));
    
    if (cartaCombate === combate.ganhou) {
      this.jogada.maiorCartaJogador = this.jogadorJogando.id;
      jogadaQuery.update({ maiorCarta: JSON.stringify(carta), maiorCartaJogador: this.jogada.maiorCartaJogador })
    }
    if (cartaCombate === combate.empate) {
      this.jogada.maiorCartaJogador = null;
      jogadaQuery.update({ maiorCarta: null, maiorCartaJogador: this.jogada.maiorCartaJogador })
    }

    jogadaQuery.collection("jogadas").add( { jogador: this.jogadorJogando.nome, ...carta, jogadorId: this.jogadorJogando.id });
    jogadorQuery.update({ cartas: this.jogadorJogando.cartas });
    
    if (this.proximoJogador() === this.jogada.comeca) {
      if (this.jogada.maiorCartaJogador !== null) {
        rodadaQuery.collection("jogadores").doc(this.jogada.maiorCartaJogador.toString()).ref.get().then(function(doc) {
          const { fez } = doc.data();
          console.log('fez: ' + fez);
          rodadaQuery.collection("jogadores").doc(this.jogada.maiorCartaJogador.toString()).update({ fez: fez+1 })
        }.bind(this))
      }
      if (this.jogadorJogando.cartas.length === 0) {
        // terminar rodada
        // criar nova rodada
        // comeca um a frente do jogador que estava comecando a rodada, tambem é a vez dele
        // atualizar vida dos jogadores
      }
      else {
        // criar nova jogada
      }
    }
    this.atualizarRodada();
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
    var manilha = this.baralho.tirarManilha();
    this.atualizarManilha(manilha);
  }

  distribuir() {
    var query = this.db.collection(config.jogoDB).doc(this.route.snapshot.paramMap.get("id"));
    var quantidadeCartas = this.jogo.rodada+1 > this.rodada.jogadoresCount ? this.jogo.rodada+1 % this.rodada.jogadoresCount : this.jogo.rodada+1;
    for (var i = 0; i < this.rodada.jogadoresCount; i++) {
      var cartaArray = this.baralho.tiraCartas(quantidadeCartas)
      query.collection(config.rodadaDB).doc(this.jogo.rodada.toString()).collection("jogadores").doc(i.toString()).update({cartas: cartaArray.map(carta => JSON.stringify(carta))});
    }
    this.atualizarRodada(this.etapa.palpite);
  }

  palpite(palpite: number) {
    var query = this.db.collection(config.jogoDB).doc(this.route.snapshot.paramMap.get("id"));
    query.collection(config.rodadaDB).doc(this.jogo.rodada.toString()).collection("jogadores").doc(this.jogadorJogando.id.toString()).update({ palpite: palpite });
    if (this.proximoJogador() === this.rodada.comeca+1) {
      this.criarJogada(this.proximoJogador())
      this.atualizarRodada(this.etapa.jogarCarta);
    }
    this.atualizarRodada();
  }
  
  proximoJogador(jogadorVez: number = null) {
    const vez = jogadorVez === null ?  this.rodada.vez+1 : jogadorVez ;
    return vez === this.rodada.jogadoresCount ? 0 : vez;
  }

  atualizarRodada(rodadaEtapa: number = null, jogadorVez: number = null) {
    var query = this.db.collection(config.jogoDB).doc(this.route.snapshot.paramMap.get("id"));
    const rodadaVez = jogadorVez === null ? this.proximoJogador() : jogadorVez;
    if (rodadaEtapa) {
      if (rodadaEtapa === this.etapa.jogarCarta) {
        query.collection(config.rodadaDB).doc(this.rodada.id).update({ etapa: rodadaEtapa });
      }
      else {
        query.collection(config.rodadaDB).doc(this.rodada.id).update({ etapa: rodadaEtapa, vez: rodadaVez });
      }
    }
    else {
      query.collection(config.rodadaDB).doc(this.rodada.id).update({ vez: rodadaVez });
    }
  }

  atualizarManilha(manilha) {
    var query = this.db.collection(config.jogoDB).doc(this.route.snapshot.paramMap.get("id"));
    query.collection(config.rodadaDB).doc(this.rodada.id).update({manilha: JSON.stringify(manilha)});
  }

  // TODO levar isso para o servico da rodada
  loadRodada(rodadaId) {
    var query = this.db.collection(config.jogoDB).doc(this.route.snapshot.paramMap.get("id"));
    this.jogadoresJogo = query.collection("jogadores").snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          console.log("jogo.jogadores: " + id + " - " + JSON.stringify(data));
          return { id, ...data };
        });
      }),
    );

    query.collection(config.rodadaDB).doc(rodadaId).snapshotChanges().pipe(
      map(a => {
        const data : any = a.payload.data();
        const id = a.payload.id;
        console.log("rodada: " + JSON.stringify(data));
        if (data.manilha) data.manilha = Carta.fromString(data.manilha);
        if (data.jogadaAtual) {
          const jogadaQuery = query.collection(config.rodadaDB).doc(rodadaId).collection("jogada").doc(data.jogadaAtual)
          
          jogadaQuery.snapshotChanges().pipe(map(a => {
            const data = a.payload.data() as Jogo;
            const id = a.payload.id;
            return { id, ...data };
          })).subscribe(jogada => this.jogada = jogada);

          jogadaQuery.collection("jogadas").snapshotChanges().pipe(
            map(actions => {
              return actions.map(a => {
                const data = a.payload.doc.data();
                const id = parseInt(a.payload.doc.id, 10);
                console.log("jogada: " + id + " - " + JSON.stringify(data));
                return { id, ...data };
              });
            }),
          ).subscribe(jogadas => this.jogadas = jogadas);
        } 
        return { id, ...data };
      })
    ).subscribe(rodada => this.rodada = rodada)

    this.jogadores = query.collection(config.rodadaDB).doc(rodadaId).collection("jogadores").snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = parseInt(a.payload.doc.id, 10);

          if (data.cartas) {
            data.cartas = data.cartas.map(carta => {
              let cartaObj = Carta.fromString(carta);
              if(this.rodada.manilha) cartaObj.setManilha(this.rodada.manilha);
              return cartaObj; 
            });
          }

          if (data.jogadorId === this.jogadorJogandoId) {
            this.jogadorJogando = { id, ...data };
          }
          console.log("jogadores: " + id + " - " + JSON.stringify(data));
          return { id, ...data };
        });
      }),
    );
  }

  criarJogada(jogadorComeca) {
    const jogada = {
      comeca: jogadorComeca,
      ganhou: null,
      maiorCarta: null,
    }
    var query = this.db.collection(config.jogoDB).doc(this.route.snapshot.paramMap.get("id"));
    query.collection(config.rodadaDB).doc(this.rodada.id).collection("jogada").add(jogada)
    .then(function(docRef) {
      query.collection(config.rodadaDB).doc(this.rodada.id).update({jogadaAtual: docRef.id});
    }.bind(this))
    .catch(function(error) {
      console.error("Error adding document: ", error);
    });
  }

  ngOnInit() {
    this.jogadorJogandoId = this.jogoService.jogadorCriado();
    console.log("meu id = " + this.jogadorJogandoId);

    var query = this.db.collection(config.jogoDB).doc(this.route.snapshot.paramMap.get("id"));
    query.snapshotChanges().pipe(
      map(a => {
        const data = a.payload.data() as Jogo;
        const id = a.payload.id;
        console.log("jogo: " + JSON.stringify(data));
        this.loadRodada(data.rodada.toString());
        return { id, ...data };
      })
    ).subscribe(jogo => this.jogo = jogo);  
  }
}