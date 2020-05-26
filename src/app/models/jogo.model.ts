export class Jogo {
    constructor() {
        this.status = Status.aguardandoJogadores
        this.rodada = 0
        this.quantidadeJogadores = 0
    }

    id: string
    status: number
    rodada: number
    quantidadeJogadores: number
    rodadas: any
    eventos: any
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
