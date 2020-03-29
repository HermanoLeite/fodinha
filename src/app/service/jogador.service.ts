import { CookieService } from 'ngx-cookie-service';
import { collections } from '../context';
import { Jogador } from '../containers/jogador/jogador.model';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';

import { JogoService } from './jogo.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class JogadorService {
    jogadores: AngularFirestoreCollection<Jogador>;
    private jogadorDoc: AngularFirestoreDocument<Jogador>;

    constructor(private db: AngularFirestore, private jogoService: JogoService, private cookieService: CookieService) {
        this.jogadores = db.collection(collections.jogador);
    }


    buscarJogador(jogoId: string, jogadorDocId: string): Observable<Jogador> {
        return this.db.collection(collections.jogo).doc(jogoId).collection(collections.jogador).doc(jogadorDocId).snapshotChanges()
            .pipe(map(({ payload }) => payload.data() as Jogador));
    }

    setJogo(jogoId) {
        this.jogadores = this.db.collection(collections.jogo).doc(jogoId).collection(collections.jogador);
    }

    criarJogador(jogadorNome, jogoId): Promise<string> {
        var jogador = {
            nome: jogadorNome,
            comecar: false,
            removido: false,
            jogando: true,
            vidas: 5,
        };
        return this._addjogador(jogador, jogoId);
    }

    private _addjogador(jogador, jogoId): Promise<string> {
        var jogadorCollections = this.db.collection(collections.jogo).doc(jogoId).collection(collections.jogador);
        return new Promise(resolve => {
            jogadorCollections.add(jogador)
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

    updatejogador(id, update, jogoId) {
        this.jogadorDoc = this.db.doc<Jogador>(`${collections.jogo}/${jogoId}/${collections.jogador}/${id}`);
        this.jogadorDoc.update(update);
    }

    deletejogador(id, jogoId) {
        this.jogadorDoc = this.db.doc<Jogador>(`${collections.jogo}/${jogoId}/${collections.jogador}/${id}`);
        this.jogadorDoc.delete();
    }

    async comecarJogo(jogoId) {
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

