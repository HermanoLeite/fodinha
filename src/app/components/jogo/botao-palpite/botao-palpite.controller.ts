import { Etapa } from 'src/app/containers/jogo/jogo.status';
import { AngularFirestoreDocument } from '@angular/fire/firestore';

export class BotaoPalpiteController {
    constructor(rodadaDoc, rodada, criarJogada, jogador) {
        this.rodadaDoc = rodadaDoc
        this.rodada = rodada
        this.criarJogada = criarJogada
        this.jogador = jogador
    }
    private rodadaDoc: AngularFirestoreDocument;
    private rodada: any;
    private criarJogada: Function;
    private jogador: any;

    palpite(palpite: number): void {
        const jogadorDoc = this.rodadaDoc.collection("Jogadores").doc(this.jogador.id.toString());
        jogadorDoc.update({ palpite: palpite });

        const proximoJogador = this.proximoJogador();

        if (this.rodada.comeca === this.rodada.vez) {
            this.criarJogada(proximoJogador, this.rodadaDoc)
            this.rodadaDoc.update({ etapa: Etapa.jogarCarta, vez: proximoJogador });
        }
        else {
            this.rodadaDoc.update({ vez: proximoJogador });
        }
    }

    proximoJogador(): number {
        const vez = this.rodada.vez + 1;
        return vez === this.rodada.jogadoresCount ? 0 : vez;
    }
}