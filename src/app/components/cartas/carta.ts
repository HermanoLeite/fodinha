import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class Carta {
  private carta: String;
  private naipe: String;
  private img: String;
  private naipeValor: naipeValor;
  private cartaValor: cartaValor;
  constructor(cartaValor: cartaValor, naipeValor: naipeValor, carta: string, naipe: string, img: string = null) {
    this.naipeValor = naipeValor;
    this.cartaValor = cartaValor;
    this.naipe = naipe;
    this.carta = carta;
    this.img = img;
  }

  static fromString(carta: string) {
    if (carta === null) return null;
    const cartaObj = JSON.parse(carta);
    return new Carta(cartaObj.cartaValor, cartaObj.naipeValor, cartaObj.carta, cartaObj.naipe, cartaObj.img);
  }

  isManilha(vira: Carta) {
    if (vira.cartaValor === cartaValor.tres) {
      return this.cartaValor === cartaValor.quatro;
    }
    else {
      return vira.cartaValor === (this.cartaValor - 1);
    }
  }

  combate(cartaAdversaria: Carta, vira: Carta) {
    if (cartaAdversaria === null) {
      return combate.ganhou;
    }

    if (this.isManilha(vira)) {
      if (this.cartaValor === cartaAdversaria.cartaValor) {
        return this.naipeValor > cartaAdversaria.naipeValor ? combate.ganhou : combate.perdeu;
      }
      return combate.ganhou;
    }

    if (cartaAdversaria.isManilha(vira)) {
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