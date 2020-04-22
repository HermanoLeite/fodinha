export class Jogo {
    id: string;
    nome: string;
    status: number;
    rodada: number;
    rodadas: any;
}

export enum Status {
    aguardandoJogadores = 0,
    jogando = 1,
    finalizado = 2,
}

export enum Etapa {
    embaralhar = 0,
    manilha = 1,
    distribuir = 2,
    palpite = 3,
    jogarCarta = 4,
}
