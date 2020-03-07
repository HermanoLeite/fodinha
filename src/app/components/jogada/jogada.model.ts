import { Carta } from '../cartas/carta'

export interface Jogada {
    comeca: string;
    maiorCarta: string;
    maiorCartaObj: Carta;
    maiorCartaJogador: string;
}