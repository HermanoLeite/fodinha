export class Jogador {
    constructor(nome) {
        this.nome = nome;
        this.comecar = false;
        this.removido = false;
        this.jogando = true;
        this.vidas = 5;
    }

    nome: string;
    comecar: boolean;
    removido: boolean;
    jogando: boolean;
    vidas: number;
}