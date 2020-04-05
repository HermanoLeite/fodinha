import { CookieService } from 'ngx-cookie-service';
import { collections } from '../context';
import { Jogador } from '../models/Jogador';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';

import { JogoService } from './jogo.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { JogadorDocumento } from '../models/JogadorDocumento';

@Injectable()
export class JogadorService {
    jogadores: AngularFirestoreCollection<Jogador>;
    private jogadorDoc: AngularFirestoreDocument<Jogador>;
    private jogadorDocId: string;

    constructor(private db: AngularFirestore, private jogoService: JogoService, private cookieService: CookieService,
        private route: ActivatedRoute, ) {
        this.jogadores = db.collection(collections.jogador);
        this.jogadorDocId = this.cookieService.get("userId");
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
        this.jogadorDocId = await this._addjogador(jogador, jogoId);
        return this.jogadorDocId;
    }

    private _addjogador(jogador: Jogador, jogoId): Promise<string> {
        var jogadorCollections = this.db.collection(collections.jogo).doc(jogoId).collection(collections.jogador);
        return new Promise(resolve => {
            jogadorCollections.add({ ...jogador })
                .then(function (docRef) {
                    this.cookieService.set("userId", docRef.id);
                    this.jogoService.acrescentaJogador(jogoId);
                    resolve(docRef.id);
                }.bind(this))
                .catch(function (error) {
                    console.error("Error adding document: ", error);
                    resolve(null);
                });
        });
    }

    jogadorCriado(): string {
        return this.cookieService.get("userId");
    }

    removerJogador({ jogador, id }: JogadorDocumento, jogoId: string): void {
        jogador.removido = true;
        this._updatejogador(jogador, jogoId, id);
    }

    updatejogador(jogador: Jogador, jogoId: string): void {
        this._updatejogador(jogador, jogoId, this.jogadorDocId)
    }

    private _updatejogador(jogador: Jogador, jogoId: string, jogadorId: string): void {
        this.jogadorDoc = this.db.doc<Jogador>(`${collections.jogo}/${jogoId}/${collections.jogador}/${jogadorId}`);
        this.jogadorDoc.update({ ...jogador });
    }

    deletejogador(id: string, jogoId: string): void {
        this.jogadorDoc = this.db.doc<Jogador>(`${collections.jogo}/${jogoId}/${collections.jogador}/${id}`);
        this.jogadorDoc.delete();
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

