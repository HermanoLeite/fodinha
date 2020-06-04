import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, filter } from 'rxjs/operators';

import { JogoController } from '../../controllers/jogo.controller';
import { Carta } from '../../models/carta.model'
import { Jogada } from '../../models/jogada.model'
import { Jogo, Status, Etapa } from '../../models/jogo.model';
import { Jogador } from 'src/app/models/jogador.model';

@Component({
  selector: 'app-jogo',
  templateUrl: './index.html',
  styleUrls: ['./index.css', '../style.css'],
})
export class JogoComponent implements OnInit {
  jogoId: string
  jogadorJogandoId: string

  rodadaId: string
  rodada: any
  jogo: any
  jogada: Jogada = null
  jogadas: any = null
  eventos = []
  jogadores$: any
  jogadorJogando: Jogador

  Etapa: Etapa
  jogando: boolean = false

  constructor(private jogoController: JogoController, private route: ActivatedRoute) { }

  entregarCartas() {
    this.jogoController.novoEvento(this.jogoId, { nome: "Entregando as cartas...", mensagem: "" })
    this.jogoController.entregarCartas(this.jogoId, this.rodadaId, this.rodada.jogadoresCount)

    const proximoJogador = this.proximoJogador(this.rodada.vez, this.rodada.jogadoresCount)
    this.jogoController.atualizaEtapa(this.jogoId, this.rodadaId, proximoJogador, Etapa.palpite)
  }

  enviarPalpite(palpite: number): void {
    this.jogoController.novoEvento(this.jogoId, { nome: this.jogadorJogando.nome, mensagem: `Tem que fazer ${palpite} ${palpite === 1 ? 'carta' : 'cartas'}` })
    this.jogoController.atualizaPalpiteJogador(this.jogoId, this.rodadaId, this.jogadorJogando.id.toString(), palpite)

    const proximoJogador = this.proximoJogador(this.rodada.vez, this.rodada.jogadoresCount)
    if (this.rodada.comeca === this.rodada.vez) {
      this.jogoController.criarJogada(proximoJogador, this.jogoId, this.rodadaId)
      this.jogoController.atualizaEtapa(this.jogoId, this.rodadaId, proximoJogador, Etapa.jogarCarta)
    }
    else {
      this.jogoController.atualizaJogadorVez(this.jogoId, this.rodadaId, proximoJogador)
    }
  }

  async jogarCarta(cartaIndex) {
    const carta: Carta = this.jogadorJogando.cartas.splice(cartaIndex, 1).pop()
    const vencedor = this.jogoController.realizarJogada(this.jogoId, carta, this.jogada, this.jogadorJogando, this.rodada)
    this.jogoController.atualizarCartasDeJogador(this.jogoId, this.rodadaId, this.jogadorJogando.id.toString(), this.jogadorJogando.cartas)
    this.passaVez(vencedor);
  }

  private passaVez(vencedor: string) {
    const proximoJogador = this.proximoJogador(this.rodada.vez, this.rodada.jogadoresCount);
    if (this.todosJogaram(proximoJogador, this.jogada.comeca)) {
      this.finalizarJogada(vencedor);
    }
    else {
      this.jogoController.atualizaJogadorVez(this.jogoId, this.rodadaId, proximoJogador);
    }
  }

  private async finalizarJogada(vencedor: string): Promise<void> {
    await this.jogoController.atualizaQuemFezJogada(this.jogoId, this.rodada.id, vencedor);
    if (this.acabaramAsCartas(this.jogadorJogando)) {
      this.jogoController.finalizarRodada(this.jogoId, this.rodada.id);
    }
    else {
      this.jogoController.comecarNovaJogada(vencedor, this.jogada.comeca, this.jogoId, this.rodada.id);
    }
  }

  jogoFinalizado(): boolean {
    if (this.jogo)
      return this.jogo.status === Status.finalizado

    return false
  }

  etapaJogarCarta = (etapa) => etapa === Etapa.jogarCarta

  private proximoJogador(jogadorVez: number, jogadoresCount: number): number {
    const vez = jogadorVez + 1
    return (vez === jogadoresCount) ? 0 : vez
  }

  private acabaramAsCartas = (jogador) => jogador.cartas.length === 0

  private todosJogaram = (proximoJogador, jogadorQueComecou) => proximoJogador === jogadorQueComecou

  private carregaJogadores = (jogo) => {
    const rodadaId = jogo.rodada.toString()

    const configuraJogador = (jogadores) => jogadores.map(({ payload }) => {
      const data = payload.doc.data()
      const id = parseInt(payload.doc.id, 10)

      if (data.cartas) data.cartas = data.cartas.map(carta => Carta.fromString(carta))

      if (data.jogadorId === this.jogadorJogandoId) {
        this.jogadorJogando = { id, ...data }
      }
      return { id, ...data }
    });

    this.jogadores$ = this.jogoController
      .jogadoresRodadaStream(this.jogoId, rodadaId)
      .pipe(map(configuraJogador));

    return jogo
  }

  private carregaJogada(rodadaId: any, jogadaAtual) {
    this.jogoController
      .jogadaStream(this.jogoId, rodadaId, jogadaAtual)
      .subscribe(jogada => this.jogada = jogada)
  }

  private carregaJogadas(rodadaId: any, jogadaAtual) {
    this.jogoController
      .jogadasStream(this.jogoId, rodadaId, jogadaAtual)
      .subscribe(jogadas => this.jogadas = jogadas)
  }

  private carregaRodada = (jogo) => {
    const rodadaId = jogo.rodada.toString()

    const carregaJogada = (rodada) => {
      if (rodada.jogadaAtual) {
        this.carregaJogada(rodadaId, rodada.jogadaAtual)
        this.carregaJogadas(rodadaId, rodada.jogadaAtual)
      }
      return rodada
    }

    this.jogoController
      .rodadaStream(this.jogoId, rodadaId)
      .pipe(map(carregaJogada))
      .subscribe(rodada => this.rodada = rodada)

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

  private rodadaMudouOuJogoTerminou = ({ rodada, status }) =>
    (rodada.toString() != this.rodadaId || status === Status.finalizado)

  ngOnInit() {
    this.jogoId = this.route.snapshot.paramMap.get("id")
    this.jogadorJogandoId = this.jogoController.jogadorJogandoId()

    this.jogoController
      .jogoStream(this.jogoId)
      .pipe(
        map(this.caregaEvento),
        filter(this.rodadaMudouOuJogoTerminou),
        map(this.setRodadaId),
        map(this.carregaRodada),
        map(this.carregaJogadores),
      ).subscribe(jogo => this.jogo = jogo)
  }
}
