import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, filter } from 'rxjs/operators';

import { JogoController } from '../../controllers/jogo.controller';
import { Carta } from '../../models/carta.model'
import { Jogada } from '../../models/jogada.model'
import { Jogo, Status, Etapa } from '../../models/jogo.model';

@Component({
  selector: 'app-jogo',
  templateUrl: './index.html',
  styleUrls: ['./index.css', '../style.css'],
})
export class JogoComponent implements OnInit {
  jogoId: string
  rodadaId: string
  jogo: any
  jogadores$: any
  jogadoresJogo: any
  jogadorJogandoId: any
  jogadorJogando: any
  rodada: any
  jogada: any = null
  jogadas: any = null
  todosPalpitaram: boolean = false
  Etapa: Etapa
  jogando: boolean = false
  eventos = []

  constructor(private jogoController: JogoController, private route: ActivatedRoute) { }

  comecarRodada() {
    this.jogoController.comecar(this.rodada.vez, this.rodada.jogadoresCount, this.jogo.rodada, this.jogoId, this.rodadaId)
  }

  enviarPalpite(palpite: number): void {
    this.jogoController.atualizaPalpiteJogador(this.jogoId, this.rodadaId, this.jogadorJogando.id.toString(), palpite)
    this.jogoController.novoEvento(this.jogoId, { nome: this.jogadorJogando.nome, mensagem: `Tem que fazer ${palpite} ${palpite === 1 ? 'carta' : 'cartas'}` })

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

    var vencedor = this.jogoController.realizarJogada(carta, this.jogadorJogando, this.jogada, this.rodada, this.jogoId);
    var proximoJogador = this.proximoJogador(this.rodada.vez, this.rodada.jogadoresCount);

    if (this.completouRodada(proximoJogador, this.jogada.comeca)) {
      await this.jogoController.atualizaQuemFezJogada(this.jogoId, this.rodada.id, vencedor);

      if (this.acabaramAsCartas(this.jogadorJogando)) {
        this.jogoController.encerrarJogada(this.jogoId, this.rodada.id, this.jogo.rodada);
      }
      else {
        this.jogoController.comecarNovaJogada(vencedor, this.jogada.comeca, this.jogoId, this.rodada.id)
      }
    }
    else {
      this.jogoController.atualizaRodada(this.jogoId, this.rodadaId, { vez: proximoJogador })
    }
  }

  jogoFinalizado(): boolean {
    if (this.jogo)
      return this.jogo.status === Status.finalizado;

    return false;
  }

  etapaJogarCarta = (etapa) => etapa === Etapa.jogarCarta;

  private acabaramAsCartas = (jogador) => jogador.cartas.length === 0

  private completouRodada = (proximoJogador, jogadorQueComecou) => proximoJogador === jogadorQueComecou

  private proximoJogador(rodadaVez: number, jogadoresCount: number): number {
    const vez = rodadaVez + 1;
    return vez === jogadoresCount ? 0 : vez;
  }

  private carregaJogada(rodadaId: any, jogadaAtual) {
    const configuraJogada = (jogada) => {
      if (jogada.maiorCarta) {
        jogada.maiorCartaObj = Carta.fromString(jogada.maiorCarta);
      }
      return jogada;
    };

    this.jogoController
      .jogadaStream(this.jogoId, rodadaId, jogadaAtual)
      .pipe(map(configuraJogada))
      .subscribe(jogada => this.jogada = jogada);
  }

  private carregaJogadas(rodadaId: any, jogadaAtual) {
    const configuraJogadas = (actions) => actions.map(a => {
      const data = a.payload.doc.data();
      const id = a.payload.doc.id;
      return { id, ...data };
    });

    this.jogoController
      .jogadasStream(this.jogoId, rodadaId, jogadaAtual)
      .pipe(map(configuraJogadas))
      .subscribe(jogadas => this.jogadas = jogadas);
  }

  private carregaJogadores = (jogo) => {
    const rodadaId = jogo.rodada.toString()

    const configuraJogador = (jogadores) => jogadores.map(({ payload }) => {
      const data = payload.doc.data();
      const id = parseInt(payload.doc.id, 10);

      if (data.cartas) data.cartas = data.cartas.map(carta => Carta.fromString(carta))

      if (data.jogadorId === this.jogadorJogandoId) {
        this.jogadorJogando = { id, ...data };
      }
      return { id, ...data };
    });

    this.jogadores$ = this.jogoController
      .jogadoresRodadaStream(this.jogoId, rodadaId)
      .pipe(map(configuraJogador));

    return jogo
  }

  private carregaRodada = (jogo) => {
    const rodadaId = jogo.rodada.toString()

    const carregaJogada = (rodada) => {
      if (rodada.jogadaAtual) {
        this.carregaJogada(rodadaId, rodada.jogadaAtual);
        this.carregaJogadas(rodadaId, rodada.jogadaAtual);
      }
      return rodada
    }

    this.jogoController
      .rodadaStream(this.jogoId, rodadaId)
      .pipe(
        map(carregaJogada)
      ).subscribe(rodada => this.rodada = rodada)

    return jogo
  }

  private caregaEvento = (jogo) => {
    this.eventos = jogo.eventos;
    return jogo;
  }

  private setRodadaId = (jogo) => {
    this.rodadaId = jogo.rodada.toString();
    return jogo
  }

  private rodadaMudou = ({ rodada }) => rodada.toString() != this.rodadaId

  ngOnInit() {
    this.jogoId = this.route.snapshot.paramMap.get("id")
    this.jogadorJogandoId = this.jogoController.jogadorJogandoId()

    this.jogoController
      .jogoStream(this.jogoId)
      .pipe(
        map(this.caregaEvento),
        filter(this.rodadaMudou),
        map(this.setRodadaId),
        map(this.carregaRodada),
        map(this.carregaJogadores),
      ).subscribe(jogo => this.jogo = jogo);
  }
}
