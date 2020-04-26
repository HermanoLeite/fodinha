import { Baralho } from 'src/app/models/Baralho';
import { Etapa } from 'src/app/models/Jogo';
import { collections } from 'src/app/context'

export class RodadaController {
    public rodadaDoc;
    public jogadorVez;
    public quantidadeDeJogadores;
    public rodada;

    constructor(rodadaDoc, jogadorVez, quantidadeDeJogadores, rodada) {
        this.rodadaDoc = rodadaDoc
        this.jogadorVez = jogadorVez
        this.quantidadeDeJogadores = quantidadeDeJogadores
        this.rodada = parseInt(rodada)
    }

    comecar() {
        var baralho = this.embaralhar();
        baralho = this.tirarManilha(baralho);
        this.distribuir(baralho);
    }

    embaralhar() {
        var baralho = new Baralho();
        baralho.embaralhar();
        return baralho
    }

    tirarManilha(baralho: Baralho) {
        var manilha = baralho.tirarVira();
        this.atualizarManilha(manilha);
        return baralho;
    }

    distribuir(baralho: Baralho) {
        var quantidadeCartas = this.quantidadeDeCartas(baralho.quantidadeCartasTotal(), this.quantidadeDeJogadores, this.rodada);
        console.log('quantidadeCartas => ', quantidadeCartas)
        for (var i = 0; i < this.quantidadeDeJogadores; i++) {
            const cartaArray = baralho.tiraCartas(quantidadeCartas);
            const cartaArrayJSON = cartaArray.map(carta => JSON.stringify(carta));

            this.entregarCarta(i.toString(), cartaArrayJSON)
        }

        this.atualizarRodada();
    }

    quantidadeDeCartas(qtdCartasTotal: number, jogadoresCount: number, rodada: number): number {
        console.log('qtdCartasTotal => ', qtdCartasTotal)
        console.log('jogadoresCount => ', jogadoresCount)
        console.log('rodada => ', rodada)
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

    atualizarManilha(manilha) {
        this.rodadaDoc.update({ manilha: JSON.stringify(manilha) });
    }

    entregarCarta(jogador, cartaArrayJSON) {
        this.rodadaDoc.collection(collections.jogadores)
            .doc(jogador)
            .update({ cartas: cartaArrayJSON });
    }

    atualizarRodada(): void {
        var proximoJogador = this.jogadorVez + 1;
        if (proximoJogador === this.quantidadeDeJogadores) {
            proximoJogador = 0;
        }
        this.rodadaDoc.update({ etapa: Etapa.palpite, vez: proximoJogador });
    }
}
