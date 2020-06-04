import { Carta } from './carta.model'

export class Jogador {
    constructor(nome) {
        this.nome = nome
        this.comecar = false
        this.removido = false
        this.jogando = true
        this.vidas = 5
    }

    id: string
    nome: string
    comecar: boolean
    removido: boolean
    jogando: boolean
    vidas: number
    cartas: Array<Carta>
}
