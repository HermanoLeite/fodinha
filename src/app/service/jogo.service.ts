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

    jogosStream(): Observable<Jogo[]> {
        return this.firebase.jogosSnapshot().pipe(
            map(jogos => jogos.map(({ payload }) => this._payloadToJogo(payload)))
        );
    }

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

    realizarJogada(carta: Carta, jogador, jogada, rodada, rodadaDoc) {
        const jogadorId = jogador.id
        const rodadaJogadaAtual = rodada.jogadaAtual
        const maiorCarta = jogada.maiorCarta
        const maiorCartaJogador = jogada.maiorCartaJogador
        const manilha = rodada.manilha
        const jogadorNome = jogador.nome
        const jogadorCartas = jogador.cartas

        const resultado = carta.combate(Carta.fromString(maiorCarta), manilha);

        const jogadorDoc = rodadaDoc.collection(collections.jogadores).doc(jogadorId.toString());
        const jogadaDoc = rodadaDoc.collection(collections.jogada).doc(rodadaJogadaAtual);
        const jogadasCollection = jogadaDoc.collection(collections.jogadas);

        jogadasCollection.add({ jogador: jogadorNome, ...carta, jogadorId: jogadorId });
        jogadorDoc.update({ cartas: jogadorCartas.map(carta => JSON.stringify(carta)) });

        if (resultado === combate.ganhou) {
            jogadaDoc.update({ maiorCarta: JSON.stringify(carta), maiorCartaJogador: jogadorId });
            return jogadorId
        }

        if (resultado === combate.empate) {
            jogadaDoc.update({ maiorCartaJogador: null });
            return null
        }

        return maiorCartaJogador
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

