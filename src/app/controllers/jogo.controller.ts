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

    deletarJogo = (jogoId: string) => this.firebase.deletarJogo(jogoId)

    novoJogo() {
        const jogo = new Jogo()
        return this.firebase.adicionaJogo(jogo)
    }

    private configuraDocumento = ({ payload }) => {
        const data = payload.data()
        const id = payload.id;
        return { id, ...data };
    }

    jogoStream = (jogoId) => this.firebase.jogoSnapshot(jogoId).pipe(map(this.configuraDocumento))

    jogosStream = (): Observable<Jogo[]> =>
        this.firebase.jogosSnapshot()
            .pipe(map(jogos => jogos.map(({ payload }) => {
                const data = payload.doc.data() as Jogo;
                const id = payload.doc.id;

                return { id, ...data } as Jogo;
            })))

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

    atualizaPalpiteJogador = (jogoId, rodadaId, jogadorId, palpite) => this.firebase.atualizaJogadorRodada(jogoId, rodadaId, jogadorId, { palpite })

    novoEvento = (jogoId, evento) => {
        this.firebase.adicionaEvento(jogoId, evento)
    }

    comecarJogo(jogadoresParticipantes, jogoId): void {
        this.firebase.atualizaJogo(jogoId, { status: Status.jogando })
        this.criarRodada(jogadoresParticipantes, jogoId, 0)
    }

    async criarRodada(jogadoresParticipantes, jogoId, rodadaNro) {
        const rodadaId = rodadaNro.toString()
        const jogadorComeca = this.jogadorComeca(rodadaNro, jogadoresParticipantes)

        await this.novaRodada(jogoId, rodadaId, jogadorComeca, jogadoresParticipantes.length)
        this.adicionaJogadoresRodada(jogadoresParticipantes, jogoId, rodadaId);

        this.firebase.atualizaJogo(jogoId, { rodada: rodadaNro })
    }

    private jogadorComeca = (rodadaNro, jogadoresParticipantes) => rodadaNro >= jogadoresParticipantes.length ? rodadaNro % jogadoresParticipantes.length : rodadaNro;

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
        this.firebase.atualizaRodada(jogoId, rodadaId, { jogadaAtual: docRef.id, vez: jogadorComeca })
    }

    comecarNovaJogada(maiorCartaJogador, jogadorComecouJogada, jogoId, rodadaId) {
        if (maiorCartaJogador !== null) {
            this.criarJogada(maiorCartaJogador, jogoId, rodadaId);
            this.firebase.atualizaRodada(jogoId, rodadaId, { vez: maiorCartaJogador });
        }
        else {
            this.criarJogada(jogadorComecouJogada, jogoId, rodadaId);
            this.firebase.atualizaRodada(jogoId, rodadaId, { vez: jogadorComecouJogada });
        }
    }

    atualizaEtapa = (jogoId, rodadaId, jogadorVez, etapa) => this.firebase.atualizaRodada(jogoId, rodadaId, { vez: jogadorVez, etapa: etapa })
    atualizaJogadorVez = (jogoId, rodadaId, jogadorVez) => this.firebase.atualizaRodada(jogoId, rodadaId, { vez: jogadorVez })

    entregarCartas(quantidadeDeJogadores: number, rodada: number, jogoId: string): void {
        const rodadaId: string = rodada.toString()

        const baralho = this.embaralhar();

        const vira = baralho.tirarVira();
        this.salvarVira(jogoId, rodadaId, vira);

        this.distribuir(jogoId, rodadaId, baralho, quantidadeDeJogadores);
    }

    private embaralhar(): Baralho {
        const baralho: Baralho = new Baralho();
        baralho.embaralhar();
        return baralho
    }

    private salvarVira = (jogoId: string, rodadaId: string, vira: Carta): void => {
        this.novoEvento(jogoId, { nome: "Manilha", mensagem: vira.toString() })
        this.firebase.atualizaRodada(jogoId, rodadaId, { manilha: JSON.stringify(vira) })
    }

    private distribuir(jogoId: string, rodadaId: string, baralho: Baralho, quantidadeDeJogadores: number): void {
        const rodadaNumero = parseInt(rodadaId, 10)
        var quantidadeCartas = this.quantidadeDeCartas(baralho.quantidadeCartasTotal(), quantidadeDeJogadores, rodadaNumero)
        for (var i = 0; i < quantidadeDeJogadores; i++) {
            const cartaArray = baralho.tiraCartas(quantidadeCartas);
            const cartaArrayJSON = cartaArray.map(carta => JSON.stringify(carta));
            this.entregarCarta(jogoId, rodadaId, i.toString(), cartaArrayJSON)
        }
    }

    private entregarCarta = (jogoId: string, rodadaId: string, jogadorId: string, cartaArrayJSON: Array<string>): Promise<void> =>
        this.firebase.atualizaJogadorRodada(jogoId, rodadaId, jogadorId, { cartas: cartaArrayJSON })

    private quantidadeDeCartas(qtdCartasTotal: number, jogadoresCount: number, rodada: number): number {
        const qtdCartasMax: number = qtdCartasTotal - 1 / jogadoresCount;
        if (rodada < qtdCartasMax) {
            return rodada + 1;
        }
        var sobe = (rodada / qtdCartasMax) % 2 === 0;
        if (sobe) {
            return (rodada % qtdCartasMax) + 1
        }
        return (qtdCartasMax * (rodada / qtdCartasMax)) - rodada;
    }
}
