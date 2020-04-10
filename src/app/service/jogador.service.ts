import { collections } from '../context';
import { Jogador } from '../models/Jogador';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';

import { JogoService } from './jogo.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { JogadorDocumento } from '../models/JogadorDocumento';

@Injectable()
export class JogadorService {
    jogadores: AngularFirestoreCollection<Jogador>;
    private jogadorDoc: AngularFirestoreDocument<Jogador>;

    constructor(
        private db: AngularFirestore,
        private jogoService: JogoService, ) {
        this.jogadores = db.collection(collections.jogador);
    }


    buscarJogador(jogoId: string, jogadorDocId: string): Observable<Jogador> {
        return this.db.collection(collections.jogo).doc(jogoId).collection(collections.jogador).doc(jogadorDocId).snapshotChanges()
            .pipe(map(({ payload }) => payload.data() as Jogador));
    }

    setJogo(jogoId) {
        this.jogadores = this.db.collection(collections.jogo).doc(jogoId).collection(collections.jogador);
    }

    async criarJogador(jogadorNome: string, jogoId): Promise<string> {
        var jogador = new Jogador(jogadorNome);
        const jogadorDocId = await this._addjogador(jogador, jogoId);
        return jogadorDocId;
    }

    private _addjogador(jogador: Jogador, jogoId): Promise<string> {
        var jogadorCollections = this.db.collection(collections.jogo).doc(jogoId).collection(collections.jogador);
        return new Promise(resolve => {
            jogadorCollections.add({ ...jogador })
                .then(function (docRef) {
                    this.jogoService.acrescentaJogador(jogoId);
                    resolve(docRef.id);
                }.bind(this))
                .catch(function (error) {
                    console.error("Error adding document: ", error);
                    resolve(null);
                });
        });
    }

    removerJogador({ jogador, id }: JogadorDocumento, jogoId: string): void {
        jogador.removido = true;
        this._updatejogador(jogador, jogoId, id);
    }

    updatejogador(jogador: Jogador, jogoId: string, jogadorDocId): void {
        this._updatejogador(jogador, jogoId, jogadorDocId)
    }

    private _updatejogador(jogador: Jogador, jogoId: string, jogadorId: string): void {
        this.jogadorDoc = this.db.doc<Jogador>(`${collections.jogo}/${jogoId}/${collections.jogador}/${jogadorId}`);
        this.jogadorDoc.update({ ...jogador });
    }

    async comecarJogo(jogoId: string): Promise<void> {
        var jogadores = await this.jogadoresParaOJogo(jogoId)
        return this.jogoService.comecarJogo(jogadores, jogoId);
    }

    jogadoresParaOJogo(jogoId) {
        var jogadoresNoJogo: any[] = [];
        return new Promise(resolve => {
            this.db.firestore.collection(collections.jogo).doc(jogoId).collection(collections.jogador).get().then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    const data = doc.data();
                    if (!data.removido && data.comecar) jogadoresNoJogo.push({ id: doc.id, ...data })
                });
                resolve(jogadoresNoJogo);
            });
        });
    }

    async todosJogadoresComecaram(jogoId) {
        var count = 0;
        var querySnapshotPromise = this.db.firestore.collection(collections.jogo).doc(jogoId).collection(collections.jogador).get()
        return new Promise(resolve => {
            querySnapshotPromise.then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    const data = doc.data();
                    if (!data.removido && !data.comecar) resolve(false);
                    if (!data.removido && data.comecar) count++;
                });
                if (count > 1) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }
}

