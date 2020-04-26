import { AngularFirestore } from '@angular/fire/firestore';
import { collections } from '../context';
import { Jogo, Etapa } from '../models/Jogo';
import { Injectable } from '@angular/core';

@Injectable()
export class FirebaseService {
    constructor(private db: AngularFirestore) { }

    async getJogo(jogoId) {
        var doc = await this.db.firestore.collection(collections.jogo).doc(jogoId).get()
        return doc.data()
    }

    getJogadoresJogo = (jogoId) => this.db.firestore.collection(collections.jogo).doc(jogoId).collection(collections.jogador).get()

    getJogadoresRodada = (jogoId, rodadaId, jogadorId) =>
        this.db.firestore.collection(collections.jogo)
            .doc(jogoId)
            .collection(collections.rodadas)
            .doc(rodadaId)
            .collection(collections.jogadores)
            .doc(jogadorId)
            .get();

    jogadoresSnapshot = (jogoId) => this.db.collection(collections.jogo).doc(jogoId).collection(collections.jogador).snapshotChanges()

    jogadorSnapshot = (jogoId, jogadorId) => this.db.collection(collections.jogo).doc(jogoId).collection(collections.jogador).doc(jogadorId).snapshotChanges()

    jogoSnapshot = (jogoId) => this.db.collection(collections.jogo).doc(jogoId).valueChanges()

    jogosSnapshot = () => this.db.collection(collections.jogo).snapshotChanges()

    deletarJogo = (id: string) => this.db.collection(collections.jogo).doc(id).delete()

    adicionaJogo = (jogo: Jogo) => this.db.collection(collections.jogo).add({ ...jogo })

    adicionaJogadorAoJogo = (jogoId, jogador) => this.db.collection(collections.jogo).doc(jogoId).collection(collections.jogador).add({ ...jogador })

    adicionaJogadaJogador = (jogoId, rodadaId, jogadorId, jogada) =>
        this.db.collection(collections.jogo)
            .doc(jogoId)
            .collection(collections.rodadas)
            .doc(rodadaId)
            .collection(collections.jogada)
            .doc(jogadorId)
            .collection(collections.jogadas)
            .add(jogada)

    adicionaJogadaRodada = (jogoId, rodadaId, jogada) =>
        this.db.collection(collections.jogo)
            .doc(jogoId)
            .collection(collections.rodadas)
            .doc(rodadaId)
            .collection(collections.jogada)
            .add(jogada)

    atualizaJogo = (id: string, update) => this.db.collection(collections.jogo).doc(id).update(update)

    atualizaRodada = (jogoId, rodadaId, update) =>
        this.db.collection(collections.jogo)
            .doc(jogoId)
            .collection(collections.rodadas)
            .doc(rodadaId)
            .update(update)

    atualizaCartas = (jogoId, rodadaId, jogadorId, cartas) =>
        this.db.collection(collections.jogo)
            .doc(jogoId)
            .collection(collections.rodadas)
            .doc(rodadaId)
            .collection(collections.jogadores)
            .doc(jogadorId).update({ cartas })

    atualizaJogada = (jogoId, rodadaId, jogadaId, update) =>
        this.db.collection(collections.jogo)
            .doc(jogoId)
            .collection(collections.rodadas)
            .doc(rodadaId)
            .collection(collections.jogada)
            .doc(jogadaId)
            .update(update)

    atualizaJogadorRodada = (jogoId, rodadaId, jogadorId, update) =>
        this.db.collection(collections.jogo)
            .doc(jogoId)
            .collection(collections.rodadas)
            .doc(rodadaId)
            .collection(collections.jogadores)
            .doc(jogadorId)
            .update(update);

    atualizaJogadorJogo = (jogoId, jogadorId, update) =>
        this.db.collection(collections.jogo)
            .doc(jogoId)
            .collection(collections.jogador)
            .doc(jogadorId)
            .update(update);

    async atualizaQuantasJogadorFez(jogoId, rodadaId, jogadorId) {
        const doc = await this.getJogadoresRodada(jogoId, rodadaId, jogadorId)

        const { fez } = doc.data()
        await this.atualizaJogadorRodada(jogoId, rodadaId, jogadorId, { fez: fez + 1 });
    }

    async novaRodada(jogoId, rodadaId, jogadorComeca, jogadoresParticipantes) {
        var rodadaDoc = this.db.collection(collections.jogo).doc(jogoId).collection(collections.rodadas).doc(rodadaId.toString());

        await this.criaRodada(rodadaDoc, jogadorComeca, jogadoresParticipantes.length)
        this.criaJogadoresRodada(jogadoresParticipantes, rodadaDoc)
        this.atualizaJogo(jogoId, { rodada: rodadaId })
    }

    private async criaRodada(rodadaDoc, jogadorComeca, quantidadeJogadores) {
        await rodadaDoc.set({
            manilha: null,
            comeca: jogadorComeca,
            vez: jogadorComeca,
            etapa: Etapa.embaralhar,
            jogadoresCount: quantidadeJogadores
        })
    }

    private criaJogadoresRodada(jogadoresParticipantes, rodadaDoc) {
        var count = 0
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
    }

    async jogadoresProximaRodada(jogoId, rodadaId) {
        await this.atualizaJogadorVida(jogoId, rodadaId)
        var jogadoresProximaRodada: any[] = [];
        var jogadores = await this.getJogadoresJogo(jogoId)
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
            await callback(array[index], index, array)
        }
    }
}
