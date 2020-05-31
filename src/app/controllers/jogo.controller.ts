import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Carta, combate } from '../models/carta.model';
import { Jogo, Status, Etapa } from '../models/jogo.model';
import { FirebaseService } from '../services/firebase.service';
import { StorageService, Keys } from '../services/storage.service';
import { Baralho } from '../models/baralho.model';

@Injectable()
export class JogoController {
    constructor(private storage: StorageService, private firebase: FirebaseService) { }

    jogadorJogandoId = () => this.storage.get("userId")

    novoJogo() {
        const jogo = new Jogo()
        return this.firebase.adicionaJogo(jogo)
    }
    private configuraDocumento = ({ payload }) => {
        const data = payload.data()
        const id = payload.id;
        return { id, ...data };
    };

    jogoStream = (jogoId) => this.firebase.jogoSnapshot(jogoId).pipe(map(this.configuraDocumento))

    jogosStream = (): Observable<Jogo[]> =>
        this.firebase.jogosSnapshot()
            .pipe(map(jogos => jogos.map(({ payload }) => {
                const data = payload.doc.data() as Jogo;
                const id = payload.doc.id;

                return { id, ...data } as Jogo;
            })));

    rodadaAtualStream = async (jogoId) => {
        const rodadaAtual = await this.firebase.rodadaAtual(jogoId)
        return this.firebase.rodadaSnapshot(jogoId, rodadaAtual.toString())
    }

    rodadaAtual = (jogoId) => this.firebase.rodadaAtual(jogoId)

    jogadoresRodadaStream = (jogoId, rodadaId) => this.firebase.jogadoresRodadaSnapshot(jogoId, rodadaId)

    jogadoresStream = (jogoId) => this.firebase.jogadoresSnapshot(jogoId)

    setManilha = (rodada) => {
        rodada.manilha = Carta.fromString(rodada.manilha);
        return rodada;
    };

    rodadaStream = (jogoId, rodadaId) =>
        this.firebase.rodadaSnapshot(jogoId, rodadaId)
            .pipe(
                map(this.configuraDocumento),
                map(this.setManilha)
            )

    configuraJogada = (jogada) => {
        if (jogada.maiorCarta) {
            jogada.maiorCartaObj = Carta.fromString(jogada.maiorCarta);
        }
        return jogada;
    };

    jogadaStream = (jogoId, rodadaId, jogadaId) =>
        this.firebase.jogadaSnapshot(jogoId, rodadaId, jogadaId)
            .pipe(
                map(this.configuraDocumento),
                map(this.configuraJogada))

    configuraDocumentos = (actions) => actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...data };
    });

    jogadasStream = (jogoId, rodadaId, jogadaId) => this.firebase.jogadasSnapshot(jogoId, rodadaId, jogadaId).pipe(map(this.configuraDocumentos))

    deletarJogo = (id: string) => this.firebase.deletarJogo(id)

    atualizaPalpiteJogador = (jogoId, rodadaId, jogadorId, palpite) => this.firebase.atualizaJogadorRodada(jogoId, rodadaId, jogadorId, { palpite })

    novoEvento = (jogoId, evento) => {
        evento.criadoEm = Date.now()
        this.firebase.adicionaEvento(jogoId, evento)
    }

    comecarJogo(jogadoresParticipantes, jogoId): void {
        this.firebase.atualizaJogo(jogoId, { status: Status.jogando })
        this.criarRodada(jogadoresParticipantes, jogoId, 0)
    }

    async criarRodada(jogadoresParticipantes, jogoId, rodadaNro) {
        const rodadaId = rodadaNro.toString()
        const jogadorComeca = rodadaNro >= jogadoresParticipantes.length ? rodadaNro % jogadoresParticipantes.length : rodadaNro;

        await this.novaRodada(jogoId, rodadaId, jogadorComeca, jogadoresParticipantes.length)
        this.adicionaJogadoresRodada(jogadoresParticipantes, jogoId, rodadaId);

        this.firebase.atualizaJogo(jogoId, { rodada: rodadaNro })
    }

    private adicionaJogadoresRodada(jogadoresParticipantes: any, jogoId: any, rodadaId: any) {
        var count = 0;
        jogadoresParticipantes.forEach(jogadorParticipante => {
            const jogador = {
                jogadorId: jogadorParticipante.id,
                nome: jogadorParticipante.nome,
                fez: 0,
                cartas: null,
                palpite: null,
                vidas: jogadorParticipante.vidas
            };
            this.firebase.adicionaJogadorRodada(jogoId, rodadaId, count.toString(), jogador);
            count++;
        });
    }

    async novaRodada(jogoId, rodadaId, jogadorComeca, quantidadaJogadores) {
        const rodada = {
            manilha: null,
            comeca: jogadorComeca,
            vez: jogadorComeca,
            etapa: Etapa.embaralhar,
            jogadoresCount: quantidadaJogadores
        }

        await this.firebase.adicionaRodada(jogoId, rodadaId, rodada)
    }

    async atualizaQuemFezJogada(jogoId, rodadaId, maiorCartaJogador) {
        var evento = { nome: "Fim de jogada", mensagem: "cangou!" }
        if (maiorCartaJogador !== null) {
            const jogadorId = maiorCartaJogador.toString()
            const { fez, nome } = await this.firebase.getJogadorRodada(jogoId, rodadaId, jogadorId)
            const fezAtualizado = fez + 1
            evento.mensagem = `${nome} fez ${fezAtualizado} ${fezAtualizado > 1 ? 'jogadas' : 'jogada'}`

            await this.firebase.atualizaJogadorRodada(jogoId, rodadaId, jogadorId, { fez: fezAtualizado });
        }
        this.novoEvento(jogoId, evento)
    }

    async encerrarJogada(jogoId, rodadaId, rodada) {
        await this.atualizaJogadorVida(jogoId, rodadaId)
        this.novoEvento(jogoId, { nome: "Fim de Rodada", mensagem: "" })
        var jogadoresProximaRodada = await this.jogadoresProximaRodada(jogoId);
        if (jogadoresProximaRodada.length < 2) {
            this.encerrarJogo(jogoId, jogadoresProximaRodada)
        }
        else {
            this.criarRodada(jogadoresProximaRodada, jogoId, rodada + 1);
        }
    }

    async jogadoresProximaRodada(jogoId) {
        var jogadoresProximaRodada: any[] = [];
        var jogadores = await this.firebase.getJogadoresJogo(jogoId)

        jogadores.forEach((doc) => {
            const jogador = doc.data();
            if (jogador.jogando) jogadoresProximaRodada.push({ id: doc.id, nome: jogador.nome, vidas: jogador.vidas });
        });

        return jogadoresProximaRodada;
    }

    private async atualizaJogadorVida(jogoId, rodadaId) {
        var jogadores = await this.firebase.getJogadoresRodada(jogoId, rodadaId)

        await this.asyncForEach(jogadores.docs, async (doc) => {
            const jogador = doc.data()
            const vidasPerdidas = Math.abs(jogador.fez - jogador.palpite)

            const evento = { nome: jogador.nome, mensagem: "Perdeu " + vidasPerdidas + (vidasPerdidas > 1 ? " vidas" : " vida") }
            this.novoEvento(jogoId, evento)

            var jogadorJogo = await this.firebase.getJogadorJogo(jogoId, jogador.jogadorId)
            const vidas = jogadorJogo.vidas - vidasPerdidas
            await this.firebase.atualizaJogadorJogo(jogoId, jogador.jogadorId, { vidas, jogando: vidas > 0 })
        });
    }

    private async asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array)
        }
    }

    private async encerrarJogo(jogoId, jogadoresProximaRodada) {
        if (jogadoresProximaRodada.length < 1) {
            this.novoEvento(jogoId, { nome: "Fim de Jogo", mensagem: "Sem ganhador" })
            this.firebase.atualizaJogo(jogoId, { status: Status.finalizado });
        }
        else {
            this.novoEvento(jogoId, { nome: "Fim de Jogo", mensagem: jogadoresProximaRodada[0].nome + " ganhou!" })
            this.firebase.atualizaJogo(jogoId, { status: Status.finalizado, vencedor: jogadoresProximaRodada[0].nome });
        }
    }

    realizarJogada(carta, jogador, jogada, rodada, jogoId) {
        const resultado = carta.combate(Carta.fromString(jogada.maiorCarta), rodada.manilha);
        const evento = { nome: jogador.nome, mensagem: carta.carta + " de " + carta.naipe }

        this.firebase.adicionaJogadaJogador(jogoId, rodada.id, rodada.jogadaAtual, { jogador: jogador.nome, ...carta, jogadorId: jogador.id });
        this.novoEvento(jogoId, evento)

        const cartas = jogador.cartas.map(carta => JSON.stringify(carta))
        this.firebase.atualizaJogadorRodada(jogoId, rodada.id, jogador.id.toString(), { cartas });

        if (resultado === combate.ganhou) {
            this.firebase.atualizaJogada(jogoId, rodada.id, rodada.jogadaAtual, { maiorCarta: JSON.stringify(carta), maiorCartaJogador: jogador.id });
            return jogador.id
        }

        if (resultado === combate.empate) {
            this.firebase.atualizaJogada(jogoId, rodada.id, rodada.jogadaAtual, { maiorCartaJogador: null });
            return null
        }

        return jogada.maiorCartaJogador
    }

    async criarJogada(jogadorComeca, jogoId, rodadaId) {
        const jogada = {
            comeca: jogadorComeca,
            maiorCarta: null,
        }

        var docRef = await this.firebase.adicionaJogadaRodada(jogoId, rodadaId, jogada)
        this.atualizaRodada(jogoId, rodadaId, { jogadaAtual: docRef.id, vez: jogadorComeca })
    }

    comecarNovaJogada(maiorCartaJogador, jogadorComecouJogada, jogoId, rodadaId) {
        if (maiorCartaJogador !== null) {
            this.criarJogada(maiorCartaJogador, jogoId, rodadaId);
            this.atualizaRodada(jogoId, rodadaId, { vez: maiorCartaJogador });
        }
        else {
            this.criarJogada(jogadorComecouJogada, jogoId, rodadaId);
            this.atualizaRodada(jogoId, rodadaId, { vez: jogadorComecouJogada });
        }
    }

    atualizaRodada = (jogoId, rodadaId, update) => this.firebase.atualizaRodada(jogoId, rodadaId, update)

    comecar(jogadorVez, quantidadeDeJogadores, rodada, jogoId, rodadaId) {
        this.novoEvento(jogoId, { nome: "Entregando as cartas...", mensagem: "" })
        var baralho = this.embaralhar();
        baralho = this.tirarManilha(baralho, jogoId, rodadaId);
        this.distribuir(baralho, quantidadeDeJogadores, rodada, jogadorVez, jogoId, rodadaId);
    }

    private embaralhar() {
        var baralho = new Baralho();
        baralho.embaralhar();
        return baralho
    }

    private tirarManilha(baralho: Baralho, jogoId, rodadaId) {
        var manilha = baralho.tirarVira();
        this.novoEvento(jogoId, { nome: "Manilha", mensagem: manilha.toString() })
        this.atualizarManilha(manilha, jogoId, rodadaId);
        return baralho;
    }

    private distribuir(baralho: Baralho, quantidadeDeJogadores, rodada, jogadorVez, jogoId, rodadaId) {
        var quantidadeCartas = this.quantidadeDeCartas(baralho.quantidadeCartasTotal(), quantidadeDeJogadores, rodada)
        for (var i = 0; i < quantidadeDeJogadores; i++) {
            const cartaArray = baralho.tiraCartas(quantidadeCartas);
            const cartaArrayJSON = cartaArray.map(carta => JSON.stringify(carta));
            this.entregarCarta(i.toString(), cartaArrayJSON, jogoId, rodadaId)
        }

        this.atualizarRodada(jogadorVez, quantidadeDeJogadores, jogoId, rodadaId);
    }

    private quantidadeDeCartas(qtdCartasTotal: number, jogadoresCount: number, rodada: number): number {
        var qtdCartasMax = qtdCartasTotal - 1 / jogadoresCount;
        if (rodada < qtdCartasMax) {
            return rodada + 1;
        }
        var sobe = (rodada / qtdCartasMax) % 2 === 0;
        if (sobe) {
            return (rodada % qtdCartasMax) + 1
        }
        return (qtdCartasMax * (rodada / qtdCartasMax)) - rodada;
    }

    private atualizarManilha(manilha, jogoId, rodadaId) {
        this.firebase.atualizaRodada(jogoId, rodadaId, { manilha: JSON.stringify(manilha) })
    }

    private entregarCarta(jogador, cartaArrayJSON, jogoId, rodadaId) {
        this.firebase.atualizaJogadorRodada(jogoId, rodadaId, jogador, { cartas: cartaArrayJSON })
    }

    private atualizarRodada(jogadorVez, quantidadeDeJogadores, jogoId, rodadaId): void {
        var proximoJogador = jogadorVez + 1;
        if (proximoJogador === quantidadeDeJogadores) {
            proximoJogador = 0;
        }
        this.firebase.atualizaRodada(jogoId, rodadaId, { etapa: Etapa.palpite, vez: proximoJogador })
    }
}
