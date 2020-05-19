import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';

import { JogoController } from '../../controllers/jogo.controller';
import { Carta } from '../../models/carta.model'
import { Jogada } from '../../models/jogada.model'
import { Jogo, Status, Etapa } from '../../models/jogo.model';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-jogo',
  templateUrl: './index.html',
})
export class JogoComponent implements OnInit {
  jogoId: string
  rodadaId: string
  jogo: any
  jogadores: any
  jogadoresJogo: any
  rodada: any
  jogadorJogandoId: any
  jogadorJogando: any
  jogada: any = null
  jogadas: any = null
  todosPalpitaram: boolean = false
  Etapa: Etapa
  jogando: boolean = false
  visaoCarta: boolean
  status: string;

  constructor(
    private jogoController: JogoController,
    private route: ActivatedRoute,
    private storageService: StorageService) {
    this.jogoId = this.route.snapshot.paramMap.get("id")
    this.visaoCarta = this.jogoController.getVisaoCarta()
  }

  comecarRodada() {
    this.jogoController.comecar(this.rodada.vez, this.rodada.jogadoresCount, this.jogo.rodada, this.jogoId, this.rodadaId)
  }

  enviarPalpite(palpite: number): void {
    this.jogoController.atualizaPalpiteJogador(this.jogoId, this.rodadaId, this.jogadorJogando.id.toString(), palpite)

    const proximoJogador = this.proximoJogador(this.rodada.vez, this.rodada.jogadoresCount);

    if (this.rodada.comeca === this.rodada.vez) {
      this.jogoController.criarJogada(proximoJogador, this.jogoId, this.rodadaId)
      this.jogoController.atualizaRodada(this.jogoId, this.rodadaId, { etapa: Etapa.jogarCarta, vez: proximoJogador });
    }
    else {
      this.jogoController.atualizaRodada(this.jogoId, this.rodadaId, { vez: proximoJogador });
    }
  }

  async jogarCarta(cartaJogadorIndex) {
    var carta = this.jogadorJogando.cartas.splice(cartaJogadorIndex, 1).pop();

    var vencedor = this.jogoController.realizarJogada(carta, this.jogadorJogando, this.jogada, this.rodada, this.jogo.id);
    var proximoJogador = this.proximoJogador(this.rodada.vez, this.rodada.jogadoresCount);

    if (this.completouRodada(proximoJogador)) {
      await this.jogoController.atualizaQuemFezJogada(this.jogo.id, this.rodada.id, vencedor);

      if (this.acabaramAsCartas()) {
        this.jogoController.encerrarJogada(this.jogo.id, this.rodada.id, this.jogo.rodada);
      }
      else {
        this.jogoController.comecarNovaJogada(vencedor, this.jogada.comeca, this.jogo.id, this.rodada.id)
      }
    }
    else {
      this.jogoController.atualizaRodada(this.jogoId, this.rodadaId, { vez: proximoJogador })
    }
  }

  setVisaoCarta(visaoCarta: boolean) {
    this.visaoCarta = this.jogoController.setVisaoCarta(visaoCarta);
  }

  jogoFinalizado(): boolean {
    if (this.jogo)
      return this.jogo.status === Status.finalizado;

    return false;
  }

  etapaJogarCarta = (etapa) => etapa === Etapa.jogarCarta;

  private acabaramAsCartas = () => this.jogadorJogando.cartas.length === 0

  private completouRodada = (proximoJogador) => proximoJogador === this.jogada.comeca

  private proximoJogador(rodadaVez: number, jogadoresCount: number): number {
    const vez = rodadaVez + 1;
    return vez === jogadoresCount ? 0 : vez;
  }

  private loadRodada(rodadaId): void {
    this.jogoController.rodadaStream(this.jogoId, rodadaId).pipe(
      map(a => {
        const data: any = a.payload.data();
        const id = a.payload.id;
        if (data) data.manilha = Carta.fromString(data.manilha);
        if (data.jogadaAtual) {
          this.jogoController.jogadaStream(this.jogoId, rodadaId, data.jogadaAtual).pipe(map(a => {
            const data = a.payload.data() as Jogada;
            if (data.maiorCarta) data.maiorCartaObj = Carta.fromString(data.maiorCarta);
            const id = a.payload.id;
            return { id, ...data };
          })).subscribe(jogada => this.jogada = jogada);

          this.jogoController.jogadasStream(this.jogoId, rodadaId, data.jogadaAtual).pipe(
            map(actions => {
              return actions.map(a => {
                const data = a.payload.doc.data()
                const id = a.payload.doc.id
                return { id, ...data }
              });
            }),
          ).subscribe(jogadas => this.jogadas = jogadas)
        }
        return { id, ...data }
      })
    ).subscribe(rodada => this.rodada = rodada)

    this.jogadores = this.jogoController.jogadoresRodadaStream(this.jogoId, rodadaId).pipe(
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

    this.jogoController.jogoStream(this.jogoId).pipe(
      map(a => {
        const data = a.payload.data() as Jogo;
        const id = a.payload.id;
        if (data.rodada.toString() != this.rodadaId) {
          this.rodadaId = data.rodada.toString()
          this.loadRodada(this.rodadaId)
        }
        return { id, ...data };
      })
    ).subscribe(jogo => this.jogo = jogo);
  }
}
