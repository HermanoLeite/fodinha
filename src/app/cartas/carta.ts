import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class Carta {
  private carta: String;
  private naipe: String;
  private naipeValor: naipeValor;
  private cartaValor: cartaValor;
  manilha: boolean;
  constructor(cartaValor: cartaValor, naipeValor: naipeValor, carta: string, naipe: string) {
    this.naipeValor = naipeValor;
    this.cartaValor = cartaValor;
    this.naipe = naipe;
    this.carta = carta;
    this.manilha = false;
  }
  
  static fromString(carta: string) {
    const cartaObj = JSON.parse(carta);
    return new Carta(cartaObj.cartaValor, cartaObj.naipeValor, cartaObj.carta, cartaObj.naipe);
  }

  setManilha(manilha: Carta) {
    if(manilha.cartaValor === cartaValor.tres) {
      this.manilha = this.cartaValor === cartaValor.quatro ? true : false;
    }
    else {
      this.manilha = manilha.cartaValor === this.cartaValor-1 ? true : false;
    }
  }

  combate(cartaAdversaria: Carta) {
    if (this.manilha) {
      if (this.cartaValor === cartaAdversaria.cartaValor) {
        return this.naipeValor > cartaAdversaria.naipeValor ? combate.ganhou : combate.perdeu;
      }
      return combate.ganhou;
    }

    if (cartaAdversaria.manilha) {
      if (this.cartaValor === cartaAdversaria.cartaValor) {
        return this.naipeValor > cartaAdversaria.naipeValor ? combate.ganhou : combate.perdeu;
      }
      return combate.perdeu;
    }

    if (this.cartaValor === cartaAdversaria.cartaValor) {
      return combate.empate;
    }

    return this.cartaValor > cartaAdversaria.cartaValor ? combate.ganhou : combate.perdeu;
  }
}

export enum naipeValor {
  ouros = 0,
  espadas = 1,
  copas = 2,
  paus = 3,
}

export enum cartaValor {
  quatro = 0,
  cinco = 1,
  seis = 2,
  sete = 3,
  Q = 4,
  J = 5,
  K = 6,
  A = 7,
  dois = 8,
  tres = 9,
}

export enum combate {
  perdeu = -1,
  ganhou = 1,
  empate = 0,
}