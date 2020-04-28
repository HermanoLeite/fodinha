import { AngularFirestore } from '@angular/fire/firestore';
import { collections } from '../context';
import { Injectable } from '@angular/core';

@Injectable()
export class FirebaseService {
    constructor(private db: AngularFirestore) { }

    jogos = this.db.collection(collections.jogo)
    rodadasJogo = (jogoId) => this.jogo(jogoId).collection(collections.rodadas)
    jogadoresJogo = (jogoId) => this.jogo(jogoId).collection(collections.jogador)
    jogadasRodada = (jogoId, rodadaId) => this.rodadaJogo(jogoId, rodadaId).collection(collections.jogada)
    jogadoresRodada = (jogoId, rodadaId) => this.rodadaJogo(jogoId, rodadaId).collection(collections.jogadores)
    jogadasJogadaRodada = (jogoId, rodadaId, jogadaId) => this.jogadaRodada(jogoId, rodadaId, jogadaId).collection(collections.jogadas)
    jogo = (jogoId) => this.jogos.doc(jogoId)
    rodadaJogo = (jogoId, rodadaId) => this.rodadasJogo(jogoId).doc(rodadaId)
    jogadorJogo = (jogoId, jogadorId) => this.jogadoresJogo(jogoId).doc(jogadorId)
    jogadaRodada = (jogoId, rodadaId, jogadaId) => this.jogadasRodada(jogoId, rodadaId).doc(jogadaId)
    jogadorRodada = (jogoId, rodadaId, jogadorId) => this.jogadoresRodada(jogoId, rodadaId).doc(jogadorId)

    jogosSnapshot = () => this.jogos.snapshotChanges()
    jogoSnapshot = (jogoId) => this.jogo(jogoId).snapshotChanges()
    jogoStream = (jogoId) => this.jogo(jogoId).valueChanges()
    jogadoresSnapshot = (jogoId) => this.jogadoresJogo(jogoId).snapshotChanges()
    rodadaSnapshot = (jogoId, rodadaId) => this.rodadaJogo(jogoId, rodadaId).snapshotChanges()
    jogadoresRodadaSnapshot = (jogoId, rodadaId) => this.jogadoresRodada(jogoId, rodadaId).snapshotChanges()
    jogadorSnapshot = (jogoId, jogadorId) => this.jogadorJogo(jogoId, jogadorId).snapshotChanges()
    jogadaSnapshot = (jogoId, rodadaId, jogadaId) => this.jogadaRodada(jogoId, rodadaId, jogadaId).snapshotChanges()
    jogadasSnapshot = (jogoId, rodadaId, jogadaId) => this.jogadasJogadaRodada(jogoId, rodadaId, jogadaId).snapshotChanges()

    deletarJogo = (jogoId) => this.jogo(jogoId).delete()

    adicionaJogo = (jogo) => this.jogos.add({ ...jogo })
    adicionaJogadorAoJogo = (jogoId, jogador) => this.jogadoresJogo(jogoId).add({ ...jogador })
    adicionaJogadaJogador = (jogoId, rodadaId, jogadaId, jogada) => this.jogadasJogadaRodada(jogoId, rodadaId, jogadaId).add(jogada)
    adicionaJogadaRodada = (jogoId, rodadaId, jogada) => this.jogadasRodada(jogoId, rodadaId).add(jogada)
    adicionaRodada = (jogoId, rodadaId, rodada) => this.rodadaJogo(jogoId, rodadaId).set(rodada);
    adicionaJogadorRodada = (jogoId, rodadaId, jogadorId, jogador) => this.jogadorRodada(jogoId, rodadaId, jogadorId).set(jogador);

    atualizaJogo = (jogoId, update) => this.jogo(jogoId).update(update)
    atualizaRodada = (jogoId, rodadaId, update) => this.rodadaJogo(jogoId, rodadaId).update(update)
    atualizaJogada = (jogoId, rodadaId, jogadaId, update) => this.jogadaRodada(jogoId, rodadaId, jogadaId).update(update)
    atualizaJogadorRodada = (jogoId, rodadaId, jogadorId, update) => this.jogadorRodada(jogoId, rodadaId, jogadorId).update(update);
    atualizaJogadorJogo = (jogoId, jogadorId, update) => this.jogadorJogo(jogoId, jogadorId).update(update);

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
}
