import { CookieService } from 'ngx-cookie-service';
import { collections } from '../context';
import { Jogador } from '../containers/jogador/jogador.model';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';

import { JogoService } from './jogo.service';

@Injectable()
export class JogadorService {
    jogadores: AngularFirestoreCollection<Jogador>;
    private jogadorDoc: AngularFirestoreDocument<Jogador>;

    constructor(private db: AngularFirestore, private jogoService: JogoService, private cookieService: CookieService) {
        this.jogadores = db.collection(collections.jogador);
    }

    setJogo(jogoId) {
        this.jogadores = this.db.collection(collections.jogo).doc(jogoId).collection(collections.jogador);
    }


    addjogador(jogador, jogoId): Promise<string> {
        return new Promise(resolve => {
            this.jogadores.add(jogador)
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

    todosJogadoresComecaram(jogoId) {
        var count = 0;
        return new Promise(resolve => {
            this.db.firestore.collection(collections.jogo).doc(jogoId).collection(collections.jogador).get().then(function (querySnapshot) {
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

