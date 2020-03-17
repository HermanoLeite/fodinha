import { Injectable } from '@angular/core';
import { Carta, cartaValor, naipeValor } from './carta'

@Injectable({
  providedIn: 'root'
})
export class Baralho {
  public cartas = new Array<Carta>();

  constructor() {
    this.cartas.push(new Carta(cartaValor.quatro, naipeValor.ouros, 'quatro', 'ouros', '🃄'));
    this.cartas.push(new Carta(cartaValor.quatro, naipeValor.espadas, 'quatro', 'espadas', '🂤'));
    this.cartas.push(new Carta(cartaValor.quatro, naipeValor.copas, 'quatro', 'copas', '🂴'));
    this.cartas.push(new Carta(cartaValor.quatro, naipeValor.paus, 'quatro', 'paus', '🃔'));
    this.cartas.push(new Carta(cartaValor.cinco, naipeValor.ouros, 'cinco', 'ouros', '🃅'));
    this.cartas.push(new Carta(cartaValor.cinco, naipeValor.espadas, 'cinco', 'espadas', '🂥'));
    this.cartas.push(new Carta(cartaValor.cinco, naipeValor.copas, 'cinco', 'copas', '🂵'));
    this.cartas.push(new Carta(cartaValor.cinco, naipeValor.paus, 'cinco', 'paus', '🃕'));
    this.cartas.push(new Carta(cartaValor.seis, naipeValor.ouros, 'seis', 'ouros', '🃆'));
    this.cartas.push(new Carta(cartaValor.seis, naipeValor.espadas, 'seis', 'espadas', '🂦'));
    this.cartas.push(new Carta(cartaValor.seis, naipeValor.copas, 'seis', 'copas', '🂶'));
    this.cartas.push(new Carta(cartaValor.seis, naipeValor.paus, 'seis', 'paus', '🃖'));
    this.cartas.push(new Carta(cartaValor.sete, naipeValor.ouros, 'sete', 'ouros', '🃇'));
    this.cartas.push(new Carta(cartaValor.sete, naipeValor.espadas, 'sete', 'espadas', '🂧'));
    this.cartas.push(new Carta(cartaValor.sete, naipeValor.copas, 'sete', 'copas', '🂷'));
    this.cartas.push(new Carta(cartaValor.sete, naipeValor.paus, 'sete', 'paus', '🃗'));
    this.cartas.push(new Carta(cartaValor.Q, naipeValor.ouros, 'Q', 'ouros', '🃍'));
    this.cartas.push(new Carta(cartaValor.Q, naipeValor.espadas, 'Q', 'espadas', '🂭'));
    this.cartas.push(new Carta(cartaValor.Q, naipeValor.copas, 'Q', 'copas', '🂽'));
    this.cartas.push(new Carta(cartaValor.Q, naipeValor.paus, 'Q', 'paus', '🃝'));
    this.cartas.push(new Carta(cartaValor.J, naipeValor.ouros, 'J', 'ouros', '🃋'));
    this.cartas.push(new Carta(cartaValor.J, naipeValor.espadas, 'J', 'espadas', '🂫'));
    this.cartas.push(new Carta(cartaValor.J, naipeValor.copas, 'J', 'copas', '🂻'));
    this.cartas.push(new Carta(cartaValor.J, naipeValor.paus, 'J', 'paus', '🃛'));
    this.cartas.push(new Carta(cartaValor.K, naipeValor.ouros, 'K', 'ouros', '🃎'));
    this.cartas.push(new Carta(cartaValor.K, naipeValor.espadas, 'K', 'espadas', '🂮'));
    this.cartas.push(new Carta(cartaValor.K, naipeValor.copas, 'K', 'copas', '🂾'));
    this.cartas.push(new Carta(cartaValor.K, naipeValor.paus, 'K', 'paus', '🃞'));
    this.cartas.push(new Carta(cartaValor.A, naipeValor.ouros, 'A', 'ouros', '🃁'));
    this.cartas.push(new Carta(cartaValor.A, naipeValor.espadas, 'A', 'espadas', '🂡'));
    this.cartas.push(new Carta(cartaValor.A, naipeValor.copas, 'A', 'copas', '🂱'));
    this.cartas.push(new Carta(cartaValor.A, naipeValor.paus, 'A', 'paus', '🃑'));
    this.cartas.push(new Carta(cartaValor.dois, naipeValor.ouros, 'dois', 'ouros', '🃂'));
    this.cartas.push(new Carta(cartaValor.dois, naipeValor.espadas, 'dois', 'espadas', '🂢'));
    this.cartas.push(new Carta(cartaValor.dois, naipeValor.copas, 'dois', 'copas', '🂲'));
    this.cartas.push(new Carta(cartaValor.dois, naipeValor.paus, 'dois', 'paus', '🃒'));
    this.cartas.push(new Carta(cartaValor.tres, naipeValor.ouros, 'tres', 'ouros', '🃃'));
    this.cartas.push(new Carta(cartaValor.tres, naipeValor.espadas, 'tres', 'espadas', '🂣'));
    this.cartas.push(new Carta(cartaValor.tres, naipeValor.copas, 'tres', 'copas', '🂳'));
    this.cartas.push(new Carta(cartaValor.tres, naipeValor.paus, 'tres', 'paus', '🃓'));
  }

  embaralhar() {
    const primeiraVez = this.shuffle(this.cartas);
    const segundaVez = this.shuffle(primeiraVez);
    const terceiraVez = this.shuffle(segundaVez);
    const quartaVez = this.shuffle(terceiraVez);
    const quintaVez = this.shuffle(quartaVez);
    const sextaVez = this.shuffle(quintaVez);
    this.cartas = this.shuffle(sextaVez);
  }


  quantidadeCartasTotal(): number {
    return 40;
  }

  tirarVira() {
    return this.cartas.pop();
  }

  tiraCartas(quantidade: number) {
    var cartas = new Array<Carta>();
    for (var i = 0; i < quantidade; i++) {
      cartas.push(this.cartas.pop());
    }
    return cartas;
  }

  // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  private shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }
}
