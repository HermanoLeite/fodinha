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

    novoJogo(nomeJogo: string): void {
        const jogo = new Jogo(nomeJogo)
        this.firebase.adicionaJogo(jogo)
    }

    jogoStream = (jogoId) => this.firebase.jogoSnapshot(jogoId)

    jogosStream = (): Observable<Jogo[]> =>
        this.firebase.jogosSnapshot()
            .pipe(map(jogos => jogos.map(({ payload }) => this._payloadToJogo(payload))));

    jogadoresRodadaStream = (jogoId, rodadaId) => this.firebase.jogadoresRodadaSnapshot(jogoId, rodadaId)

    jogadoresStream = (jogoId) => this.firebase.jogadoresSnapshot(jogoId)

    rodadaStream = (jogoId, rodadaId) => this.firebase.rodadaSnapshot(jogoId, rodadaId)

    jogadaStream = (jogoId, rodadaId, jogadaId) => this.firebase.jogadaSnapshot(jogoId, rodadaId, jogadaId)

    jogadasStream = (jogoId, rodadaId, jogadaId) => this.firebase.jogadasSnapshot(jogoId, rodadaId, jogadaId)

    deletarJogo = (id: string) => this.firebase.deletarJogo(id)

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
        jogadoresParticipantes.forEach(jogadorParticipantes => {
            const jogador = {
                jogadorId: jogadorParticipantes.id,
                nome: jogadorParticipantes.nome,
                fez: 0,
                cartas: null,
                palpite: null,
                vidas: jogadorParticipantes.vidas
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
        if (maiorCartaJogador !== null) {
            const jogadorId = maiorCartaJogador.toString()
            const { fez } = await this.firebase.getJogadorRodada(jogoId, rodadaId, jogadorId)
            await this.firebase.atualizaJogadorRodada(jogoId, rodadaId, jogadorId, { fez: fez + 1 });
        }
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
            this.firebase.atualizaJogo(jogoId, { status: Status.finalizado });
        }
        else {
            this.firebase.atualizaJogo(jogoId, { status: Status.finalizado, vencedor: jogadoresProximaRodada[0].nome });
        }
    }

    atualizaPalpiteJogador = (jogoId, rodadaId, jogadorId, palpite) => this.firebase.atualizaJogadorRodada(jogoId, rodadaId, jogadorId, { palpite })

    realizarJogada(carta, jogador, jogada, rodada, jogoId) {
        const resultado = carta.combate(Carta.fromString(jogada.maiorCarta), rodada.manilha);

        this.firebase.adicionaJogadaJogador(jogoId, rodada.id, rodada.jogadaAtual, { jogador: jogador.nome, ...carta, jogadorId: jogador.id });

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

    private _payloadToJogo(payload): Jogo {
        const data = payload.doc.data() as Jogo;
        const id = payload.doc.id;

        return { id, ...data } as Jogo;
    }

    getVisaoCarta(): boolean {
        var visaoCarta = this.storage.get(Keys.visaoCarta);
        if (visaoCarta === undefined || visaoCarta === null || visaoCarta === "") {
            visaoCarta = "true";
            this.setVisaoCarta(visaoCarta)
        }
        return visaoCarta.toString() === "true";
    }

    setVisaoCarta(visaoCarta) {
        this.storage.set(Keys.visaoCarta, visaoCarta);
        return visaoCarta;
    }

    comecar(jogadorVez, quantidadeDeJogadores, rodada, jogoId, rodadaId) {
        var baralho = this.embaralhar();
        baralho = this.tirarManilha(baralho, jogoId, rodadaId);
        this.distribuir(baralho, quantidadeDeJogadores, rodada, jogadorVez, jogoId, rodadaId);
    }

    embaralhar() {
        var baralho = new Baralho();
        baralho.embaralhar();
        return baralho
    }

    tirarManilha(baralho: Baralho, jogoId, rodadaId) {
        var manilha = baralho.tirarVira();
        this.atualizarManilha(manilha, jogoId, rodadaId);
        return baralho;
    }

    distribuir(baralho: Baralho, quantidadeDeJogadores, rodada, jogadorVez, jogoId, rodadaId) {
        var quantidadeCartas = this.quantidadeDeCartas(baralho.quantidadeCartasTotal(), quantidadeDeJogadores, rodada);
        for (var i = 0; i < quantidadeDeJogadores; i++) {
            const cartaArray = baralho.tiraCartas(quantidadeCartas);
            const cartaArrayJSON = cartaArray.map(carta => JSON.stringify(carta));

            this.entregarCarta(i.toString(), cartaArrayJSON, jogoId, rodadaId)
        }

        this.atualizarRodada(jogadorVez, quantidadeDeJogadores, jogoId, rodadaId);
    }

    quantidadeDeCartas(qtdCartasTotal: number, jogadoresCount: number, rodada: number): number {
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

    atualizarManilha(manilha, jogoId, rodadaId) {
        this.firebase.atualizaRodada(jogoId, rodadaId, { manilha: JSON.stringify(manilha) })
    }

    entregarCarta(jogador, cartaArrayJSON, jogoId, rodadaId) {
        this.firebase.atualizaJogadorRodada(jogoId, rodadaId, jogador, { cartas: cartaArrayJSON })
    }

    atualizarRodada(jogadorVez, quantidadeDeJogadores, jogoId, rodadaId): void {
        var proximoJogador = jogadorVez + 1;
        if (proximoJogador === quantidadeDeJogadores) {
            proximoJogador = 0;
        }
        this.firebase.atualizaRodada(jogoId, rodadaId, { etapa: Etapa.palpite, vez: proximoJogador })
    }
}