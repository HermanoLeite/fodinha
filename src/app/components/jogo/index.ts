import { JogoService } from '../../service/jogo.service';
import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { collections } from '../../context';
import { Jogo, Status, Etapa } from '../../models/Jogo';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Carta } from '../../models/Carta'
import { Jogada } from '../../models/Jogada'
import { StorageService } from 'src/app/service/storage.service';
import { CartaService } from 'src/app/service/carta.service';
import { RodadaController } from './controllers/rodada.controller';

@Component({
  selector: 'app-jogo',
  templateUrl: './index.html',
})
export class JogoComponent implements OnInit {
  jogo: any
  jogadores: any
  jogadoresJogo: any
  rodada: any
  jogadorJogandoId: any
  jogadorJogando: any
  jogada: any = null
  jogadas: any = null
  todosPalpitaram: boolean = false
  jogoDoc: AngularFirestoreDocument<any>
  rodadaDoc: AngularFirestoreDocument<any>
  Etapa: Etapa
  jogando: boolean = false
  visaoCarta: boolean

  constructor(
    private db: AngularFirestore,
    private jogoService: JogoService,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private cartaService: CartaService) {

    this.visaoCarta = this.cartaService.getVisaoCarta();
    this.jogoDoc = this.db.collection(collections.jogo).doc(this.route.snapshot.paramMap.get("id"));
  }

  comecarRodada() {
    const controller = new RodadaController(this.rodadaDoc, this.rodada.vez, this.rodada.jogadoresCount, this.jogo.rodada);
    controller.comecar();
  }

  enviarPalpite(palpite: number): void {
    const jogadorDoc = this.rodadaDoc.collection(collections.jogadores).doc(this.jogadorJogando.id.toString());
    jogadorDoc.update({ palpite: palpite });

    const proximoJogador = this.proximoJogador(this.rodada.vez, this.rodada.jogadoresCount);

    if (this.rodada.comeca === this.rodada.vez) {
      this.criarJogada(proximoJogador, this.rodadaDoc)
      this.rodadaDoc.update({ etapa: Etapa.jogarCarta, vez: proximoJogador });
    }
    else {
      this.rodadaDoc.update({ vez: proximoJogador });
    }
  }

  async setVisaoCarta(visaoCarta: boolean) {
    this.visaoCarta = await this.cartaService.setVisaoCarta(visaoCarta);
  }

  jogoFinalizado(): boolean {
    if (this.jogo)
      return this.jogo.status === Status.finalizado;

    return false;
  }

  etapaJogarCarta = (etapa) => etapa === Etapa.jogarCarta;

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

  proximoJogador(rodadaVez: number, jogadoresCount: number): number {
    const vez = rodadaVez + 1;
    return vez === jogadoresCount ? 0 : vez;
  }

  acabaramAsCartas = () => this.jogadorJogando.cartas.length === 0
  completouRodada = (proximoJogador) => proximoJogador === this.jogada.comeca

  async jogarCarta(cartaJogadorIndex) {
    var carta = this.jogadorJogando.cartas.splice(cartaJogadorIndex, 1).pop();

    var vencedor = this.jogoService.realizarJogada(carta, this.jogadorJogando, this.jogada, this.rodada, this.rodadaDoc, this.jogo.id);
    var proximoJogador = this.proximoJogador(this.rodada.vez, this.rodada.jogadoresCount);

    if (this.completouRodada(proximoJogador)) {
      await this.jogoService.atualizaQuemFezJogada(this.jogo.id, this.rodada.id, vencedor);

      if (this.acabaramAsCartas()) {
        this.jogoService.encerrarJogada(this.jogo.id, this.rodada.id, this.jogoDoc, this.jogo.rodada);
      }
      else {
        this.jogoService.comecarNovaJogada(vencedor, this.jogada.comeca, this.rodadaDoc)
      }
    }
    else {
      this.rodadaDoc.update({ vez: proximoJogador });
    }
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
    this.jogadorJogandoId = this.storageService.get("userId")

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
