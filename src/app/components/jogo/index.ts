import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Jogo, Status, Etapa } from '../../models/Jogo';
import { Carta } from '../../models/Carta'
import { Jogada } from '../../models/Jogada'
import { JogoController } from '../../controllers/jogo.controller';
import { CartaController } from '../../controllers/carta.controller';

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

  constructor(
    private jogoService: JogoController,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private cartaService: CartaController) {
    this.jogoId = this.route.snapshot.paramMap.get("id")
    this.visaoCarta = this.cartaService.getVisaoCarta();
  }

  comecarRodada() {
    this.cartaService.comecar(this.rodada.vez, this.rodada.jogadoresCount, this.jogo.rodada, this.jogoId, this.rodadaId)
  }

  enviarPalpite(palpite: number): void {
    this.jogoService.atualizaPalpiteJogador(this.jogoId, this.rodadaId, this.jogadorJogando.id.toString(), palpite)

    const proximoJogador = this.proximoJogador(this.rodada.vez, this.rodada.jogadoresCount);

    if (this.rodada.comeca === this.rodada.vez) {
      this.jogoService.criarJogada(proximoJogador, this.jogoId, this.rodadaId)
      this.jogoService.atualizaRodada(this.jogoId, this.rodadaId, { etapa: Etapa.jogarCarta, vez: proximoJogador });
    }
    else {
      this.jogoService.atualizaRodada(this.jogoId, this.rodadaId, { vez: proximoJogador });
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

  proximoJogador(rodadaVez: number, jogadoresCount: number): number {
    const vez = rodadaVez + 1;
    return vez === jogadoresCount ? 0 : vez;
  }

  acabaramAsCartas = () => this.jogadorJogando.cartas.length === 0

  completouRodada = (proximoJogador) => proximoJogador === this.jogada.comeca

  async jogarCarta(cartaJogadorIndex) {
    var carta = this.jogadorJogando.cartas.splice(cartaJogadorIndex, 1).pop();

    var vencedor = this.jogoService.realizarJogada(carta, this.jogadorJogando, this.jogada, this.rodada, this.jogo.id);
    var proximoJogador = this.proximoJogador(this.rodada.vez, this.rodada.jogadoresCount);

    if (this.completouRodada(proximoJogador)) {
      await this.jogoService.atualizaQuemFezJogada(this.jogo.id, this.rodada.id, vencedor);

      if (this.acabaramAsCartas()) {
        this.jogoService.encerrarJogada(this.jogo.id, this.rodada.id, this.jogo.rodada);
      }
      else {
        this.jogoService.comecarNovaJogada(vencedor, this.jogada.comeca, this.jogo.id, this.rodada.id)
      }
    }
    else {
      this.jogoService.atualizaRodada(this.jogoId, this.rodadaId, { vez: proximoJogador })
    }
  }

  loadRodada(rodadaId): void {
    this.jogadoresJogo = this.jogoService.jogadoresStream(this.jogoId).pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      }),
    );
    this.jogoService.rodadaStream(this.jogoId, rodadaId).pipe(
      map(a => {
        const data: any = a.payload.data();
        const id = a.payload.id;
        if (data) data.manilha = Carta.fromString(data.manilha);
        if (data.jogadaAtual) {
          this.jogoService.jogadaStream(this.jogoId, rodadaId, data.jogadaAtual).pipe(map(a => {
            const data = a.payload.data() as Jogada;
            if (data.maiorCarta) data.maiorCartaObj = Carta.fromString(data.maiorCarta);
            const id = a.payload.id;
            return { id, ...data };
          })).subscribe(jogada => this.jogada = jogada);

          this.jogoService.jogadasStream(this.jogoId, rodadaId, data.jogadaAtual).pipe(
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

    this.jogadores = this.jogoService.jogadoresRodadaStream(this.jogoId, rodadaId).pipe(
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

    this.jogoService.jogoStream(this.jogoId).pipe(
      map(a => {
        const data = a.payload.data() as Jogo;
        const id = a.payload.id;
        this.rodadaId = data.rodada.toString()

        this.loadRodada(data.rodada.toString())
        return { id, ...data };
      })
    ).subscribe(jogo => this.jogo = jogo);
  }
}
