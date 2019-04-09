import { CookieService } from 'ngx-cookie-service';
import { config } from './collection.config';
import { Jogador } from './jogador.model';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';

import { JogoService } from '../jogo/jogo.service';

@Injectable()
export class JogadorService {
    jogadores: AngularFirestoreCollection<Jogador>;
    private jogadorDoc: AngularFirestoreDocument<Jogador>;
    
    constructor(private db: AngularFirestore, private jogoService: JogoService, private cookieService: CookieService) { 
        this.jogadores = db.collection(config.jogadorDB);
    }

    
    addjogador (jogador) : Promise<string> {
        return new Promise(resolve => {
            this.jogadores.add(jogador)
            .then(function(docRef) {
                this.cookieService.set("userId", docRef.id );
                resolve(docRef.id);
            }.bind(this))
            .catch(function(error) {
                console.error("Error adding document: ", error);
                resolve(null);
            });
        });
    }

    jogadorCriado () {
        return this.cookieService.get("userId");
    }

    updatejogador(id, update) {
        this.jogadorDoc = this.db.doc<Jogador>(`${config.jogadorDB}/${id}`);
        this.jogadorDoc.update(update);
    }

    deletejogador(id) {
        this.jogadorDoc = this.db.doc<Jogador>(`${config.jogadorDB}/${id}`);
        this.jogadorDoc.delete();
    }

    comecarJogo() {
        var nomeJogo = 'nome padrao';
        return this.jogoService.criarJogo(nomeJogo);
    }

    todosJogadoresComecaram() {
        var count = 0;
        return new Promise(resolve => {
            this.db.firestore.collection("Jogador").get().then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    const data = doc.data();
                    if(!data.removido && !data.comecar) resolve(false);
                    if(!data.removido && data.comecar) count++;
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

