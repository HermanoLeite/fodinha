import { config } from '../../collection.config';
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

    async comecarJogo(jogadoresParticipantes, jogoId) {
        this.db.firestore.collection(config.jogoDB).doc(jogoId).update({status: Status.jogando})
        this.criarRodada(jogadoresParticipantes, jogoId, 0);
    }

    async criarJogoInicio(nomeJogo) {
        const jogo = { nome: nomeJogo, status: Status.aguardandoJogadores, rodada: 0, quantidadeJogadores: 0 }
        const id = await this.addJogo(jogo)
        return id;
    }

    jogadorCriado () {
        return this.cookieService.get("userId");
    }

    criarJogadores(jogadoresParticipantes, id) {
        jogadoresParticipantes.forEach(jogador => {
            this.jogos.doc(id).collection(config.jogadorDB).doc(jogador.id).set({
                nome: jogador.nome,
                cor: jogador.cor,
                vidas: 5,
                removido: false,
                jogando: true
            });
        });
    }

    jogadoresProximaRodada(jogoId) {
        var jogadoresProximaRodada:any[] = [];
        return new Promise(resolve => {
            this.db.firestore.collection(config.jogoDB).doc(jogoId).collection(config.jogadorDB).get().then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    const jogador = doc.data();
                    if (jogador.jogando) jogadoresProximaRodada.push({id: doc.id, nome: jogador.nome, cor: jogador.cor });
                });
                resolve(jogadoresProximaRodada);
            });
        });
    }

    jogadoresVidasPerdidas(jogoId, rodadaId) {
        var jogadoresVidasPerdidas: Array<any> = [];
        return new Promise(resolve => {
            this.db.firestore.collection(config.jogoDB).doc(jogoId).collection("rodadas").doc(rodadaId).collection("jogadores").get().then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    const jogador = doc.data();
                    const vidasPerdidas = Math.abs(jogador.fez - jogador.palpite);
                    jogadoresVidasPerdidas.push({id: jogador.jogadorId, vidasPerdidas });
                });
                resolve(jogadoresVidasPerdidas);
            });
        });
    }

    atualizaJogadorVida(jogoQuery, jogadoresVidasPerdidas) {
        var allPromises = jogadoresVidasPerdidas.map(jogadorVidasPerdidas => {
            return new Promise(resolve => {
                jogoQuery.collection(config.jogadorDB).doc(jogadorVidasPerdidas.id).ref.get().then(function(doc) {
                    const { vidas } = doc.data();
                    if (vidas > jogadorVidasPerdidas.vidasPerdidas) {
                        jogoQuery.collection(config.jogadorDB).doc(jogadorVidasPerdidas.id).update({ vidas: vidas-jogadorVidasPerdidas.vidasPerdidas }).then(res => resolve());
                    }
                    else {
                        jogoQuery.collection(config.jogadorDB).doc(jogadorVidasPerdidas.id).update({ vidas: vidas-jogadorVidasPerdidas.vidasPerdidas, jogando: false }).then(res => resolve());
                    }
                });
            });
        });
        
        return Promise.all(allPromises);
    }

    atualizaQuemFezJogada(rodadaQuery, maiorCartaJogador) {
        return new Promise(resolve => {
            if (maiorCartaJogador !== null) {
                rodadaQuery.collection("jogadores").doc(maiorCartaJogador.toString()).ref.get().then(function(doc) {
                    const { fez } = doc.data();
                    rodadaQuery.collection("jogadores").doc(maiorCartaJogador.toString()).update({ fez: fez+1 }).then(res => resolve());
                });
            }
            else {
                resolve();
            }
        })
    }

    seJogoFinalizado(jogadoresParticipantes) {
        return jogadoresParticipantes.length < 2;
    }

    seJogoEmpatado(jogadoresParticipantes) {
        return jogadoresParticipantes.length < 1;
    }

    getVisaoCarta() : boolean {
        var visaoCarta = this.cookieService.get("visaoCarta");
        if (visaoCarta === undefined || visaoCarta === null || visaoCarta === "") {
            visaoCarta = "true";
            this.setVisaoCarta(visaoCarta)
        }  
        return visaoCarta === "true";
    }

    setVisaoCarta(visaoCarta) {
        this.cookieService.set("visaoCarta", visaoCarta );
    }

    async criarRodada(jogadoresParticipantes, jogoId, rodadaNro) {
        var count = 0;
        
        const jogadorComeca = rodadaNro >= jogadoresParticipantes.length ? rodadaNro % jogadoresParticipantes.length : rodadaNro;
        var rodadaDoc = this.jogos.doc(jogoId).collection("rodadas").doc(rodadaNro.toString());
        
        await new Promise(resolve => {
            rodadaDoc.set({
                manilha: null,
                comeca: jogadorComeca,
                vez: jogadorComeca,
                etapa: Etapa.embaralhar,
                jogadoresCount: jogadoresParticipantes.length
            }).then(res => resolve());
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

        this.jogos.doc(jogoId).update({rodada: rodadaNro});
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

    acrescentaJogador(jogoId) {
        var jogoQuery = this.db.firestore.collection(config.jogoDB).doc(jogoId);
        jogoQuery.get().then(function(doc) {
            const { quantidadeJogadores } = doc.data();
            jogoQuery.update({ quantidadeJogadores: quantidadeJogadores+1 });
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

