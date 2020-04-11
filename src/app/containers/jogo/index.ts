import { JogoService } from '../../service/jogo.service';
import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { collections } from '../../context';
import { Status, Etapa } from './jogo.status';
import { Jogo } from '../../models/Jogo';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Carta } from '../../models/Carta'
import { Jogada } from '../../models/Jogada'
import { LocalStorageService } from 'src/app/service/local-storage';

@Component({
  selector: 'app-jogo',
  templateUrl: './index.html',
})
export class JogoComponent implements OnInit {
  jogo: any;
  jogadores: any;
  jogadoresJogo: any;
  rodada: any;
  jogadorJogandoId: any;
  jogadorJogando: any;
  jogada: any = null;
  jogadas: any = null;
  todosPalpitaram: boolean = false;
  jogoDoc: AngularFirestoreDocument<any>;
  rodadaDoc: AngularFirestoreDocument<any>;
  Etapa: Etapa;
  jogando: boolean = false;

  constructor(
    private db: AngularFirestore,
    private jogoService: JogoService,
    private route: ActivatedRoute,
    private localStorageService: LocalStorageService) {
    this.jogoDoc = this.db.collection(collections.jogo).doc(this.route.snapshot.paramMap.get("id"));
  }

  jogoFinalizado(): boolean {
    if (this.jogo)
      return this.jogo.status === Status.finalizado;

    return false;
  }

  etapaJogarCarta(etapa) {
    return etapa === Etapa.jogarCarta;
  }

  criarJogada(jogadorComeca, rodadaDoc): void {
    const jogadaCollection = rodadaDoc.collection(collections.jogada);

    const jogada = {
      comeca: jogadorComeca,
      maiorCarta: null,
    }

    jogadaCollection.add(jogada)
      .then((docRef) => rodadaDoc.update({ jogadaAtual: docRef.id, vez: jogadorComeca }))
      .catch((error) => console.error("Error adding document: ", error));
  }

  loadRodada(rodadaId): void {
    this.jogadoresJogo = this.jogoDoc.collection(collections.jogador).snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      }),
    );

    this.rodadaDoc = this.jogoDoc.collection(collections.rodadas).doc(rodadaId);
    this.rodadaDoc.snapshotChanges().pipe(
      map(a => {
        const data: any = a.payload.data();
        const id = a.payload.id;
        if (data.manilha) data.manilha = Carta.fromString(data.manilha);
        if (data.jogadaAtual) {
          const jogadaQuery = this.rodadaDoc.collection(collections.jogada).doc(data.jogadaAtual);

          jogadaQuery.snapshotChanges().pipe(map(a => {
            const data = a.payload.data() as Jogada;
            if (data.maiorCarta) data.maiorCartaObj = Carta.fromString(data.maiorCarta);
            const id = a.payload.id;
            return { id, ...data };
          })).subscribe(jogada => this.jogada = jogada);

          jogadaQuery.collection(collections.jogadas).snapshotChanges().pipe(
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

    this.jogadores = this.jogoDoc.collection(collections.rodadas).doc(rodadaId).collection(collections.jogadores).snapshotChanges().pipe(
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
    this.jogadorJogandoId = this.localStorageService.get("userId")

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
