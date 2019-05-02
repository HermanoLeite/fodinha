import { JogoService } from './jogo.service';
import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { config } from '../collection.config';
import { Status, Etapa } from './jogo.status';
import { Jogo } from './jogo.model';
import { AngularFirestore } from '@angular/fire/firestore';
import { Baralho } from '../cartas/baralho'
import { Carta } from '../cartas/carta'

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

  constructor(private db: AngularFirestore, private jogoService: JogoService, private router: Router, private route: ActivatedRoute) { 
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
        return { id, ...data };
      })
    ).subscribe(rodada => this.rodada = rodada)

    this.jogadores = query.collection(config.rodadaDB).doc(rodadaId).collection("jogadores").snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          if (data.cartas) data.cartas = data.cartas.map(carta => {
            let cartaObj = Carta.fromString(carta);
            if(this.rodada.manilha) cartaObj.setManilha(this.rodada.manilha);
            return cartaObj; 
          });
          if (data.jogadorId === this.jogadorJogandoId) {
            this.jogadorJogando = { id, ...data };
          }
          console.log("jogadores: " + id + " - " + JSON.stringify(data));
          return { id, ...data };
        });
      }),
    );
  }

  palpite(palpite: number) {
    console.log("palpite: " + palpite);
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

  atualizarRodada(rodadaEtapa: number) {
    var query = this.db.collection(config.jogoDB).doc(this.route.snapshot.paramMap.get("id"));
    var rodadaVez = this.rodada.vez+1 === this.jogadores.length ? 1 : this.rodada.vez+1;
    query.collection(config.rodadaDB).doc(this.rodada.id).update({etapa: rodadaEtapa, vez: rodadaVez});
  }

  atualizarManilha(manilha) {
    var query = this.db.collection(config.jogoDB).doc(this.route.snapshot.paramMap.get("id"));
    query.collection(config.rodadaDB).doc(this.rodada.id).update({manilha: JSON.stringify(manilha)});
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