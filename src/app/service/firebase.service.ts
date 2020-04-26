import { AngularFirestore } from '@angular/fire/firestore';
import { collections } from '../context';
import { Jogo } from '../models/Jogo';
import { Injectable } from '@angular/core';

@Injectable()
export class FirebaseService {
    constructor(private db: AngularFirestore) { }

    getJogadoresJogo = (jogoId) =>
        this.db.firestore.collection(collections.jogo)
            .doc(jogoId)
            .collection(collections.jogador)
            .get()

    getJogadorJogo = async (jogoId, jogadorId) => {
        const doc = await this.db.firestore.collection(collections.jogo)
            .doc(jogoId)
            .collection(collections.jogador)
            .doc(jogadorId)
            .get()
        return doc.data()
    }

    getJogo = async (jogoId) => {
        var doc = await this.db.firestore.collection(collections.jogo).doc(jogoId).get()
        return doc.data()
    }

    getJogadoresRodada = (jogoId, rodadaId) =>
        this.db.firestore.collection(collections.jogo)
            .doc(jogoId)
            .collection(collections.rodadas)
            .doc(rodadaId)
            .collection(collections.jogadores)
            .get();

    getJogadorRodada = async (jogoId, rodadaId, jogadorId) => {
        const doc = await this.db.firestore.collection(collections.jogo)
            .doc(jogoId)
            .collection(collections.rodadas)
            .doc(rodadaId)
            .collection(collections.jogadores)
            .doc(jogadorId)
            .get();

        return doc.data()
    }

    jogadoresRodadaSnapshot = (jogoId, rodadaId) =>
        this.db.collection(collections.jogo)
            .doc(jogoId)
            .collection(collections.rodadas)
            .doc(rodadaId)
            .collection(collections.jogadores)
            .snapshotChanges()

    jogadoresSnapshot = (jogoId) => this.db.collection(collections.jogo).doc(jogoId).collection(collections.jogador).snapshotChanges()

    jogadorSnapshot = (jogoId, jogadorId) => this.db.collection(collections.jogo).doc(jogoId).collection(collections.jogador).doc(jogadorId).snapshotChanges()

    jogoSnapshot = (jogoId) => this.db.collection(collections.jogo).doc(jogoId).snapshotChanges()

    jogoStream = (jogoId) => this.db.collection(collections.jogo).doc(jogoId).valueChanges()

    jogosSnapshot = () => this.db.collection(collections.jogo).snapshotChanges()

    rodadaSnapshot = (jogoId, rodadaId) =>
        this.db.collection(collections.jogo)
            .doc(jogoId)
            .collection(collections.rodadas)
            .doc(rodadaId)
            .snapshotChanges()

    jogadaSnapshot = (jogoId, rodadaId, jogadaId) =>
        this.db.collection(collections.jogo)
            .doc(jogoId)
            .collection(collections.rodadas)
            .doc(rodadaId)
            .collection(collections.jogada)
            .doc(jogadaId)
            .snapshotChanges()

    jogadasSnapshot = (jogoId, rodadaId, jogadaId) =>
        this.db.collection(collections.jogo)
            .doc(jogoId)
            .collection(collections.rodadas)
            .doc(rodadaId)
            .collection(collections.jogada)
            .doc(jogadaId)
            .collection(collections.jogadas)
            .snapshotChanges()

    deletarJogo = (id: string) => this.db.collection(collections.jogo).doc(id).delete()

    adicionaJogo = (jogo: Jogo) => this.db.collection(collections.jogo).add({ ...jogo })

    adicionaJogadorAoJogo = (jogoId, jogador) =>
        this.db.collection(collections.jogo)
            .doc(jogoId)
            .collection(collections.jogador)
            .add({ ...jogador })

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

    adicionaRodada = (jogoId, rodadaId, rodada) =>
        this.db.collection(collections.jogo)
            .doc(jogoId)
            .collection(collections.rodadas)
            .doc(rodadaId)
            .set(rodada);

    adicionaJogadorRodada = (jogoId, rodadaId, jogadorId, jogador) =>
        this.db.collection(collections.jogo)
            .doc(jogoId)
            .collection(collections.rodadas)
            .doc(rodadaId)
            .collection(collections.jogadores)
            .doc(jogadorId)
            .set(jogador);

    atualizaJogo = (jogoId: string, update) =>
        this.db.collection(collections.jogo)
            .doc(jogoId)
            .update(update)

    atualizaRodada = (jogoId, rodadaId, update) =>
        this.db.collection(collections.jogo)
            .doc(jogoId)
            .collection(collections.rodadas)
            .doc(rodadaId)
            .update(update)

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
}
