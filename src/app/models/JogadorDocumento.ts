import { Jogador } from './Jogador';

export class JogadorDocumento {
    constructor(id: string, jogador: Jogador) {
        this.id = id;
        this.jogador = jogador;
    }

    jogador: Jogador;
    id: string;
}
