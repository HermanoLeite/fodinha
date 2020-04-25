import { AngularFirestore } from '@angular/fire/firestore';
import { collections } from '../context';
import { Jogo, Status, Etapa } from '../models/Jogo';
import { Injectable } from '@angular/core';

@Injectable()
export class FirebaseService {
    constructor(private db: AngularFirestore) { }

    jogosSnapshot = () => this.db.collection(collections.jogo).snapshotChanges()
    addJogo = (jogo: Jogo) => this.db.collection(collections.jogo).add({ ...jogo })
    deletarJogo = (id: string) => this.db.collection(collections.jogo).doc(id).delete()
    comecarJogo = (id: string) => this.db.collection(collections.jogo).doc(id).update({ status: Status.jogando })

    async criarRodada(jogoId, rodadaNro, jogadorComeca, jogadoresParticipantes) {
        var count = 0;
        var rodadaDoc = this.db.collection(collections.jogo).doc(jogoId).collection(collections.rodadas).doc(rodadaNro.toString());

        await rodadaDoc.set({
            manilha: null,
            comeca: jogadorComeca,
            vez: jogadorComeca,
            etapa: Etapa.embaralhar,
            jogadoresCount: jogadoresParticipantes.length
        })

        jogadoresParticipantes.forEach(jogador => {
            rodadaDoc.collection(collections.jogadores).doc(count.toString()).set({
                jogadorId: jogador.id,
                nome: jogador.nome,
                fez: 0,
                cartas: null,
                palpite: null
            });
            count++;
        });

        this.db.collection(collections.jogo).doc(jogoId).update({ rodada: rodadaNro });
    }

    async jogadoresProximaRodada(jogoId, rodadaId) {
        await this.atualizaJogadorVida(jogoId, rodadaId)
        var jogadoresProximaRodada: any[] = [];
        var jogadores = await this.db.firestore.collection(collections.jogo).doc(jogoId).collection(collections.jogador).get()
        jogadores.forEach((doc) => {
            const jogador = doc.data();
            if (jogador.jogando) jogadoresProximaRodada.push({ id: doc.id, nome: jogador.nome });
        });

        return jogadoresProximaRodada;
    }

    async atualizaJogadorVida(jogoId, rodadaId) {
        const jogoQuery = this.db.firestore.collection(collections.jogo).doc(jogoId)
        var jogadores = await jogoQuery.collection(collections.rodadas).doc(rodadaId).collection(collections.jogadores).get()

        await this.asyncForEach(jogadores.docs, async (doc) => {
            const jogador = doc.data()
            const vidasPerdidas = Math.abs(jogador.fez - jogador.palpite)

            var jogadorJogo = await jogoQuery.collection(collections.jogador).doc(jogador.jogadorId).get()
            const vidas = jogadorJogo.data().vidas - vidasPerdidas
            await jogoQuery.collection(collections.jogador).doc(jogador.jogadorId).update({ vidas, jogando: vidas > 0 })
        });
    }

    async asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    }

    acrescentaJogador(jogoId) {
        var jogoQuery = this.db.firestore.collection(collections.jogo).doc(jogoId);
        jogoQuery.get().then(function (doc) {
            const { quantidadeJogadores } = doc.data();
            jogoQuery.update({ quantidadeJogadores: quantidadeJogadores + 1 });
        });
    }

    async atualizaQuantasJogadorFez(jogoId, rodadaId, jogadorId) {
        const doc = await this.db.firestore
            .collection(collections.jogo)
            .doc(jogoId)
            .collection(collections.rodadas)
            .doc(rodadaId)
            .collection(collections.jogadores)
            .doc(jogadorId).get();

        const { fez } = doc.data()

        await this.db
            .collection(collections.jogo)
            .doc(jogoId)
            .collection(collections.rodadas)
            .doc(rodadaId)
            .collection(collections.jogadores)
            .doc(jogadorId).update({ fez: fez + 1 });
    }

    adicionaJogada(jogoId, rodadaId, jogadaAtual, jogada) {
        this.db
            .collection(collections.jogo)
            .doc(jogoId)
            .collection(collections.rodadas)
            .doc(rodadaId)
            .collection(collections.jogada)
            .doc(jogadaAtual)
            .collection(collections.jogadas)
            .add(jogada)
    }

    atualizaCartas(jogoId, rodadaId, jogadorId, cartas) {
        this.db
            .collection(collections.jogo)
            .doc(jogoId)
            .collection(collections.rodadas)
            .doc(rodadaId)
            .collection(collections.jogadores)
            .doc(jogadorId)
            .update({ cartas });
    }
}
