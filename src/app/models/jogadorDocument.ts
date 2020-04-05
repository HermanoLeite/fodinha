import { Jogador } from './jogador';

export class JogadorDocument {
    constructor(id: string, jogador: Jogador) {
        this.id = id;
        this.jogador = jogador;
    }

    jogador: Jogador;
    id: string;
}