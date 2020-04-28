import { Injectable } from "@angular/core";
import { Baralho } from '../models/baralho.model';
import { Etapa } from '../models/jogo.model';
import { FirebaseService } from '../services/firebase.service';
import { StorageService, Keys } from '../services/storage.service';

@Injectable()
export class CartaController {
    constructor(private storageService: StorageService, private firebase: FirebaseService) {
    }

    getVisaoCarta(): boolean {
        var visaoCarta = this.storageService.get(Keys.visaoCarta);
        if (visaoCarta === undefined || visaoCarta === null || visaoCarta === "") {
            visaoCarta = "true";
            this.setVisaoCarta(visaoCarta)
        }
        return visaoCarta.toString() === "true";
    }

    async setVisaoCarta(visaoCarta) {
        this.storageService.set(Keys.visaoCarta, visaoCarta);
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
