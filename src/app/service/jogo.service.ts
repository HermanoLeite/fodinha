import { collections } from '../context';
import { Jogo, Status, Etapa } from '../models/Jogo';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentReference } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Carta, combate } from '../models/Carta';

@Injectable()
export class JogoService {
    jogos: AngularFirestoreCollection<Jogo>;
    private jogosDoc: AngularFirestoreDocument<Jogo>;

    constructor(private db: AngularFirestore, private route: ActivatedRoute) {
        this.jogos = db.collection(collections.jogo)
    }

    async comecarJogo(jogadoresParticipantes, jogoId) {
        this.db.firestore.collection(collections.jogo).doc(jogoId).update({ status: Status.jogando })
        this.criarRodada(jogadoresParticipantes, jogoId, 0)
    }

    async novoJogo(nomeJogo: string): Promise<DocumentReference> {
        const jogo = { nome: nomeJogo, status: Status.aguardandoJogadores, rodada: 0, quantidadeJogadores: 0 }
        return this._addJogo(jogo)
    }

    private _addJogo(jogo): Promise<DocumentReference> {
        var jogoDoc: Promise<DocumentReference> = this.db.collection(collections.jogo).add(jogo)
        return jogoDoc
    }

    buscarJogoId(): string {
        return this.route.snapshot.paramMap.get("id");
    }

    jogosStream(): Observable<any> {
        return this.db.collection(collections.jogo).snapshotChanges()
            .pipe(
                map(actions => {
                    return actions.map(a => {
                        const data = a.payload.doc.data() as Jogo;
                        const id = a.payload.doc.id;

                        return { id, ...data };
                    });
                })
            );
    }

    criarJogadores(jogadoresParticipantes, id) {
        jogadoresParticipantes.forEach(jogador => {
            this.jogos.doc(id).collection(collections.jogador).doc(jogador.id).set({
                nome: jogador.nome,
                vidas: 5,
                removido: false,
                jogando: true
            });
        });
    }

    jogadoresProximaRodada(jogoId) {
        var jogadoresProximaRodada: any[] = [];
        return new Promise(resolve => {
            this.db.firestore.collection(collections.jogo).doc(jogoId).collection(collections.jogador).get().then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    const jogador = doc.data();
                    if (jogador.jogando) jogadoresProximaRodada.push({ id: doc.id, nome: jogador.nome });
                });
                resolve(jogadoresProximaRodada);
            });
        });
    }

    jogadoresVidasPerdidas(jogoId, rodadaId) {
        var jogadoresVidasPerdidas: Array<any> = [];
        return new Promise(resolve => {
            this.db.firestore.collection(collections.jogo).doc(jogoId).collection(collections.rodadas).doc(rodadaId).collection(collections.jogadores).get().then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    const jogador = doc.data()
                    const vidasPerdidas = Math.abs(jogador.fez - jogador.palpite)
                    jogadoresVidasPerdidas.push({ id: jogador.jogadorId, vidasPerdidas })
                });
                resolve(jogadoresVidasPerdidas)
            });
        });
    }

    atualizaJogadorVida(jogoQuery, jogadoresVidasPerdidas) {
        var allPromises = jogadoresVidasPerdidas.map(jogadorVidasPerdidas => {
            return new Promise(resolve => {
                jogoQuery.collection(collections.jogador).doc(jogadorVidasPerdidas.id).ref.get().then(function (doc) {
                    const { vidas } = doc.data()
                    if (vidas > jogadorVidasPerdidas.vidasPerdidas) {
                        jogoQuery.collection(collections.jogador).doc(jogadorVidasPerdidas.id).update({ vidas: vidas - jogadorVidasPerdidas.vidasPerdidas }).then(res => resolve())
                    }
                    else {
                        jogoQuery.collection(collections.jogador).doc(jogadorVidasPerdidas.id).update({ vidas: vidas - jogadorVidasPerdidas.vidasPerdidas, jogando: false }).then(res => resolve())
                    }
                });
            });
        });

        return Promise.all(allPromises)
    }

    atualizaQuemFezJogada(rodadaQuery, maiorCartaJogador) {
        return new Promise(resolve => {
            if (maiorCartaJogador !== null) {
                rodadaQuery.collection(collections.jogadores).doc(maiorCartaJogador.toString()).ref.get().then(function (doc) {
                    const { fez } = doc.data()
                    rodadaQuery.collection(collections.jogadores).doc(maiorCartaJogador.toString()).update({ fez: fez + 1 }).then(res => resolve())
                })
            }
            else {
                resolve()
            }
        })
    }

    seJogoFinalizado(jogadoresParticipantes) {
        return jogadoresParticipantes.length < 2
    }

    seJogoEmpatado(jogadoresParticipantes) {
        return jogadoresParticipantes.length < 1
    }



    async criarRodada(jogadoresParticipantes, jogoId, rodadaNro) {
        var count = 0;

        const jogadorComeca = rodadaNro >= jogadoresParticipantes.length ? rodadaNro % jogadoresParticipantes.length : rodadaNro;
        var rodadaDoc = this.jogos.doc(jogoId).collection(collections.rodadas).doc(rodadaNro.toString());

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
            rodadaDoc.collection(collections.jogadores).doc(count.toString()).set({
                jogadorId: jogador.id,
                nome: jogador.nome,
                fez: 0,
                cartas: null,
                palpite: null
            });
            count++;
        });

        this.jogos.doc(jogoId).update({ rodada: rodadaNro });
    }

    buscarJogo(id): Promise<string> {
        return new Promise(resolve => {
            this.db.firestore.collection(collections.jogo).doc(id).get().then(function (docRef) {
                resolve(docRef.data());
            }.bind(this))
                .catch(function (error) {
                    console.error("Error adding document: ", error);
                    resolve(null);
                });
        });
    }

    acrescentaJogador(jogoId) {
        var jogoQuery = this.db.firestore.collection(collections.jogo).doc(jogoId);
        jogoQuery.get().then(function (doc) {
            const { quantidadeJogadores } = doc.data();
            jogoQuery.update({ quantidadeJogadores: quantidadeJogadores + 1 });
        });
    }

    updateJogo(id, update) {
        this.jogosDoc = this.db.doc<Jogo>(`${collections.jogo}/${id}`);
        this.jogosDoc.update(update);
    }

    deletarJogo(id) {
        this.jogosDoc = this.db.collection(collections.jogo).doc(id)
        this.jogosDoc.delete();
    }

    async encerrarJogada(jogoId, rodadaId, jogoDoc, rodada) {
        var jogadoresVidasPerdidas = await this.jogadoresVidasPerdidas(jogoId, rodadaId);
        await this.atualizaJogadorVida(jogoDoc, jogadoresVidasPerdidas);
        var jogadoresProximaRodada = await this.jogadoresProximaRodada(jogoId);

        if (this.seJogoFinalizado(jogadoresProximaRodada)) {
            this.encerrarJogo(jogoDoc, jogadoresProximaRodada)
        }
        else {
            this.criarRodada(jogadoresProximaRodada, jogoId, rodada + 1);
        }
    }

    async encerrarJogo(jogoDoc, jogadoresProximaRodada) {
        if (this.seJogoEmpatado(jogadoresProximaRodada)) {
            jogoDoc.update({ status: Status.finalizado });
        }
        else {
            jogoDoc.update({ status: Status.finalizado, vencedor: jogadoresProximaRodada[0].nome });
        }
    }

    realizarJogada(carta: Carta, jogador, jogada, rodada, rodadaDoc) {
        const jogadorId = jogador.id
        const rodadaJogadaAtual = rodada.jogadaAtual
        const maiorCarta = jogada.maiorCarta
        const maiorCartaJogador = jogada.maiorCartaJogador
        const manilha = rodada.manilha
        const jogadorNome = jogador.nome
        const jogadorCartas = jogador.cartas

        const resultado = carta.combate(Carta.fromString(maiorCarta), manilha);

        const jogadorDoc = rodadaDoc.collection(collections.jogadores).doc(jogadorId.toString());
        const jogadaDoc = rodadaDoc.collection(collections.jogada).doc(rodadaJogadaAtual);
        const jogadasCollection = jogadaDoc.collection(collections.jogadas);

        jogadasCollection.add({ jogador: jogadorNome, ...carta, jogadorId: jogadorId });
        jogadorDoc.update({ cartas: jogadorCartas.map(carta => JSON.stringify(carta)) });

        if (resultado === combate.ganhou) {
            jogadaDoc.update({ maiorCarta: JSON.stringify(carta), maiorCartaJogador: jogadorId });
            return jogadorId
        }

        if (resultado === combate.empate) {
            jogadaDoc.update({ maiorCartaJogador: null });
            return null
        }

        return maiorCartaJogador
    }

    criarJogada(jogadorComeca, rodadaDoc): void {
        const jogadaCollection = rodadaDoc.collection(collections.jogada);

        const jogada = {
            comeca: jogadorComeca,
            maiorCarta: null,
        }

        jogadaCollection.add(jogada)
            .then((docRef) => rodadaDoc.update({ jogadaAtual: docRef.id, vez: jogadorComeca }))
            .catch((error) => console.error("Error adding document: ", error));
    }

    comecarNovaJogada(maiorCartaJogador, jogadorComecouJogada, rodadaDoc) {
        if (maiorCartaJogador !== null) {
            this.criarJogada(maiorCartaJogador, rodadaDoc);
            rodadaDoc.update({ vez: maiorCartaJogador });
        }
        else {
            this.criarJogada(jogadorComecouJogada, rodadaDoc);
            rodadaDoc.update({ vez: jogadorComecouJogada });
        }
    }
}

