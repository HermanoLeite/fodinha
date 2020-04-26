import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FirebaseService } from './firebase.service';
import { Jogo, Status } from '../models/Jogo';
import { Carta, combate } from '../models/Carta';

@Injectable()
export class JogoService {
    constructor(private firebase: FirebaseService) { }

    novoJogo(nomeJogo: string): void {
        const jogo = new Jogo(nomeJogo)
        this.firebase.adicionaJogo(jogo)
    }

    jogosStream = (): Observable<Jogo[]> =>
        this.firebase.jogosSnapshot()
            .pipe(map(jogos => jogos.map(({ payload }) => this._payloadToJogo(payload))));

    deletarJogo(id: string): void {
        this.firebase.deletarJogo(id)
    }

    comecarJogo(jogadoresParticipantes, jogoId): void {
        this.firebase.atualizaJogo(jogoId, { status: Status.jogando })
        this.criarRodada(jogadoresParticipantes, jogoId, 0)
    }

    criarRodada(jogadoresParticipantes, jogoId, rodadaNro) {
        const jogadorComeca = rodadaNro >= jogadoresParticipantes.length ? rodadaNro % jogadoresParticipantes.length : rodadaNro;
        this.firebase.novaRodada(jogoId, rodadaNro, jogadorComeca, jogadoresParticipantes)
    }

    async atualizaQuemFezJogada(jogoId, rodadaId, maiorCartaJogador) {
        if (maiorCartaJogador !== null) {
            await this.firebase.atualizaQuantasJogadorFez(jogoId, rodadaId, maiorCartaJogador.toString())
        }
    }

    async encerrarJogada(jogoId, rodadaId, rodada) {
        var jogadoresProximaRodada = await this.firebase.jogadoresProximaRodada(jogoId, rodadaId);
        if (jogadoresProximaRodada.length < 2) {
            this.encerrarJogo(jogoId, jogadoresProximaRodada)
        }
        else {
            this.criarRodada(jogadoresProximaRodada, jogoId, rodada + 1);
        }
    }

    async encerrarJogo(jogoId, jogadoresProximaRodada) {
        if (jogadoresProximaRodada.length < 1) {
            this.firebase.atualizaJogo(jogoId, { status: Status.finalizado });
        }
        else {
            this.firebase.atualizaJogo(jogoId, { status: Status.finalizado, vencedor: jogadoresProximaRodada[0].nome });
        }
    }

    realizarJogada(carta, jogador, jogada, rodada, jogoId) {
        const resultado = carta.combate(Carta.fromString(jogada.maiorCarta), rodada.manilha);

        this.firebase.adicionaJogadaJogador(jogoId, rodada.id, rodada.jogadaAtual, { jogador: jogador.nome, ...carta, jogadorId: jogador.id });
        this.firebase.atualizaCartas(jogoId, rodada.id, jogador.id.toString(), jogador.cartas.map(carta => JSON.stringify(carta)));

        if (resultado === combate.ganhou) {
            this.firebase.atualizaJogada(jogoId, rodada.id, rodada.jogadaAtual, { maiorCarta: JSON.stringify(carta), maiorCartaJogador: jogador.id });
            return jogador.id
        }

        if (resultado === combate.empate) {
            this.firebase.atualizaJogada(jogoId, rodada.id, rodada.jogadaAtual, { maiorCartaJogador: null });
            return null
        }

        return jogada.maiorCartaJogador
    }

    async criarJogada(jogadorComeca, jogoId, rodadaId) {
        const jogada = {
            comeca: jogadorComeca,
            maiorCarta: null,
        }

        var docRef = await this.firebase.adicionaJogadaRodada(jogoId, rodadaId, jogada)
        this.firebase.atualizaRodada(jogoId, rodadaId, { jogadaAtual: docRef.id, vez: jogadorComeca })
    }

    comecarNovaJogada(maiorCartaJogador, jogadorComecouJogada, jogoId, rodadaId) {
        if (maiorCartaJogador !== null) {
            this.criarJogada(maiorCartaJogador, jogoId, rodadaId);
            this.firebase.atualizaRodada(jogoId, rodadaId, { vez: maiorCartaJogador });
        }
        else {
            this.criarJogada(jogadorComecouJogada, jogoId, rodadaId);
            this.firebase.atualizaRodada(jogoId, rodadaId, { vez: jogadorComecouJogada });
        }
    }

    private _payloadToJogo(payload): Jogo {
        const data = payload.doc.data() as Jogo;
        const id = payload.doc.id;

        return { id, ...data } as Jogo;
    }
}

