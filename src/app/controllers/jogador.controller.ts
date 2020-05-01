import { Jogador } from '../models/jogador.model';
import { Injectable } from '@angular/core';

import { JogoController } from './jogo.controller';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { JogadorDocumento } from '../models/jogadorDocumento.model';
import { FirebaseService } from '../services/firebase.service';

@Injectable()
export class JogadorController {

    constructor(private jogoService: JogoController, private firebase: FirebaseService) { }

    buscarJogador(jogoId: string, jogadorDocId: string): Observable<Jogador> {
        return this.firebase.jogadorSnapshot(jogoId, jogadorDocId).pipe(map(({ payload }) => payload.data() as Jogador));
    }

    jogadoresStream(jogoId: string): Observable<JogadorDocumento[]> {
        return this.firebase.jogadoresSnapshot(jogoId)
            .pipe(map((jogadores) => jogadores.map(({ payload }) => this._payloadToJogadorDocumento(payload))))
    }

    jogoStream(jogoId: string) {
        return this.firebase.jogoStream(jogoId)
    }

    async criarJogador(jogadorNome: string, jogoId): Promise<string> {
        var jogador = new Jogador(jogadorNome);
        const jogadorDocId = await this._addjogador(jogador, jogoId);
        return jogadorDocId;
    }

    private async _addjogador(jogador: Jogador, jogoId): Promise<string> {
        const { quantidadeJogadores } = await this.firebase.getJogo(jogoId)
        this.firebase.atualizaJogo(jogoId, { quantidadeJogadores: quantidadeJogadores + 1 })

        const jogadorDoc = await this.firebase.adicionaJogadorAoJogo(jogoId, jogador)
        return jogadorDoc.id;
    }

    removerJogador({ jogador, id }: JogadorDocumento, jogoId: string): void {
        jogador.removido = true;
        this._updatejogador(jogador, jogoId, id);
    }

    updatejogador(jogador: Jogador, jogoId: string, jogadorDocId): void {
        this._updatejogador(jogador, jogoId, jogadorDocId)
    }

    private _updatejogador(jogador: Jogador, jogoId: string, jogadorId: string): void {
        this.firebase.atualizaJogadorJogo(jogoId, jogadorId, { ...jogador });
    }

    async comecarJogo(jogoId: string): Promise<void> {
        var jogadores = await this.jogadoresParaOJogo(jogoId)
        return this.jogoService.comecarJogo(jogadores, jogoId);
    }

    async jogadoresParaOJogo(jogoId) {
        var jogadoresNoJogo: any[] = [];
        const jogadores = await this.firebase.getJogadoresJogo(jogoId)
        jogadores.forEach((doc) => {
            const data = doc.data();
            if (!data.removido && data.comecar) jogadoresNoJogo.push({ id: doc.id, ...data })
        });
        return jogadoresNoJogo;
    }

    async todosJogadoresComecaram(jogoId) {
        var count = 0;

        var querySnapshot = await this.firebase.getJogadoresJogo(jogoId)
        querySnapshot.forEach(function (doc) {
            const data = doc.data();
            if (!data.removido && !data.comecar) return false;
            if (!data.removido && data.comecar) count++;
        });

        if (count > 1) {
            return true;
        } else {
            return false;
        }
    }

    private _payloadToJogadorDocumento(payload): JogadorDocumento {
        const data = payload.doc.data() as Jogador;
        const id = payload.doc.id;

        return new JogadorDocumento(id, data);
    }
}
