import { config } from '../collection.config';
import { Jogo } from './jogo.model';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Status, Etapa } from './jogo.status';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class JogoService {
    jogos: AngularFirestoreCollection<Jogo>;
    private jogosDoc: AngularFirestoreDocument<Jogo>;
  
    constructor(private db: AngularFirestore, private cookieService: CookieService) { 
        this.jogos = db.collection(config.jogoDB);
    }

    criarJogo(nomeJogo, jogadoresParticipantes) {
        var jogo = { nome: nomeJogo, status: Status.iniciado, etapa: Etapa.inicio, jogadores: jogadoresParticipantes }
        return this.addJogo(jogo)
    }

    addJogo(jogo) : Promise<string> {
        return new Promise(resolve => {
            this.jogos.add(jogo).then(function(docRef) {
                this.cookieService.set("jogoId", docRef.id );
                resolve(docRef.id);
            }.bind(this))
            .catch(function(error) {
                console.error("Error adding document: ", error);
                resolve(null);
            });
        });
    }

    updateJogo(id, update) {
        this.jogosDoc = this.db.doc<Jogo>(`${config.jogoDB}/${id}`);
        this.jogosDoc.update(update);
    }

    deleteJogo(id) {
        this.jogosDoc = this.db.doc<Jogo>(`${config.jogoDB}/${id}`);
        this.jogosDoc.delete();
    }
}

