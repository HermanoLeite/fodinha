import { collections } from '../context';
import { Jogo, Status } from '../models/Jogo';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Carta, combate } from '../models/Carta';
import { FirebaseService } from './firebase.service';

@Injectable()
export class JogoService {
    constructor(private firebase: FirebaseService) {
    }

    novoJogo(nomeJogo: string): void {
        const jogo = new Jogo(nomeJogo)
        this.firebase.addJogo(jogo)
    }

    jogosStream = (): Observable<Jogo[]> =>
        this.firebase.jogosSnapshot()
            .pipe(map(jogos => jogos.map(({ payload }) => this._payloadToJogo(payload))));

    deletarJogo(id: string): void {
        this.firebase.deletarJogo(id)
    }

    comecarJogo(jogadoresParticipantes, jogoId): void {
        this.firebase.comecarJogo(jogoId)
        this.criarRodada(jogadoresParticipantes, jogoId, 0)
    }

    criarRodada(jogadoresParticipantes, jogoId, rodadaNro) {
        const jogadorComeca = rodadaNro >= jogadoresParticipantes.length ? rodadaNro % jogadoresParticipantes.length : rodadaNro;
        this.firebase.criarRodada(jogoId, rodadaNro, jogadorComeca, jogadoresParticipantes)
    }

    async atualizaQuemFezJogada(jogoId, rodadaId, maiorCartaJogador) {
        if (maiorCartaJogador !== null) {
            await this.firebase.atualizaQuantasJogadorFez(jogoId, rodadaId, maiorCartaJogador.toString())
        }
    }

    async encerrarJogada(jogoId, rodadaId, jogoDoc, rodada) {
        var jogadoresProximaRodada = await this.firebase.jogadoresProximaRodada(jogoId, rodadaId);
        if (jogadoresProximaRodada.length < 2) {
            this.encerrarJogo(jogoDoc, jogadoresProximaRodada)
        }
        else {
            this.criarRodada(jogadoresProximaRodada, jogoId, rodada + 1);
        }
    }

    async encerrarJogo(jogoDoc, jogadoresProximaRodada) {
        if (jogadoresProximaRodada.length < 1) {
            jogoDoc.update({ status: Status.finalizado });
        }
        else {
            jogoDoc.update({ status: Status.finalizado, vencedor: jogadoresProximaRodada[0].nome });
        }
    }

    realizarJogada(carta, jogador, jogada, rodada, rodadaDoc, jogoId) {
        const resultado = carta.combate(Carta.fromString(jogada.maiorCarta), rodada.manilha);

        this.firebase.adicionaJogada(jogoId, rodada.id, rodada.jogadaAtual, { jogador: jogador.nome, ...carta, jogadorId: jogador.id });
        this.firebase.atualizaCartas(jogoId, rodada.id, jogador.id.toString(), jogador.cartas.map(carta => JSON.stringify(carta)));

        const jogadaDoc = rodadaDoc.collection(collections.jogada).doc(rodada.jogadaAtual);
        if (resultado === combate.ganhou) {
            jogadaDoc.update({ maiorCarta: JSON.stringify(carta), maiorCartaJogador: jogador.id });
            return jogador.id
        }

        if (resultado === combate.empate) {
            jogadaDoc.update({ maiorCartaJogador: null });
            return null
        }

        return jogada.maiorCartaJogador
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

    comecarNovaJogada(maiorCartaJogador, jogadorComecouJogada, rodadaDoc) {
        if (maiorCartaJogador !== null) {
            this.criarJogada(maiorCartaJogador, rodadaDoc);
            rodadaDoc.update({ vez: maiorCartaJogador });
        }
        else {
            this.criarJogada(jogadorComecouJogada, rodadaDoc);
            rodadaDoc.update({ vez: jogadorComecouJogada });
        }
    }

    private _payloadToJogo(payload): Jogo {
        const data = payload.doc.data() as Jogo;
        const id = payload.doc.id;

        return { id, ...data } as Jogo;
    }
}

