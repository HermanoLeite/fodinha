import { Carta } from './carta'

export interface Jogada {
    comeca: string;
    maiorCarta: string;
    maiorCartaObj: Carta;
    maiorCartaJogador: string;
}