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

    async criarJogo(nomeJogo, jogadoresParticipantes) {
        const jogo = { nome: nomeJogo, status: Status.iniciado, rodada: 0 }
        const id = await this.addJogo(jogo)
        this.criarJogadores(jogadoresParticipantes, id)
        this.criarRodada(jogadoresParticipantes, id, jogo.rodada);
        return id;
    }

    jogadorCriado () {
        return this.cookieService.get("userId");
    }

    criarJogadores(jogadoresParticipantes, id) {
        jogadoresParticipantes.forEach(jogador => {
            this.jogos.doc(id).collection("jogadores").doc(jogador.id).set({
                nome: jogador.nome,
                cor: jogador.cor,
                vida: 5,
                removido: false,
                jogando: true
            });
        });
    }
    
    criarNovaRodada() {
        // pegar o jogo
        // pegar jogadores participantes no jogo
        // pegar id do jogo
        // pegar rodada
        // chamar metodo abaixo
    }

    criarRodada(jogadoresParticipantes, id, rodadaNro) {
        var count = 0;
        
        const jogadorComeca = rodadaNro >= jogadoresParticipantes.count ? rodadaNro - jogadoresParticipantes.count : rodadaNro;
        var rodadaDoc = this.jogos.doc(id).collection("rodadas").doc(rodadaNro.toString());

        rodadaDoc.set({
            manilha: null,
            comeca: jogadorComeca,
            vez: jogadorComeca,
            etapa: Etapa.embaralhar,
            jogadoresCount: jogadoresParticipantes.length
        });

        jogadoresParticipantes.forEach(jogador => {
            rodadaDoc.collection("jogadores").doc(count.toString()).set({
                jogadorId: jogador.id,
                nome: jogador.nome,
                cor: jogador.cor,
                fez: 0,
                cartas: null,
                palpite: null
            });
            count++;
        }); 
    }

    buscarJogo(id) : Promise<string> {
        return new Promise(resolve => {
            this.db.firestore.collection(config.jogoDB).doc(id).get().then(function(docRef) {
                resolve(docRef.data());
            }.bind(this))
            .catch(function(error) {
                console.error("Error adding document: ", error);
                resolve(null);
            });
        });
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

