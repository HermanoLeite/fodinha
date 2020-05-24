import { Carta, cartaValor, naipeValor } from './carta.model'

export class Baralho {
  public cartas = new Array<Carta>();

  constructor() {
    this.cartas.push(new Carta(cartaValor.quatro, naipeValor.ouros, 'quatro', 'ouros', '🃄', '4D'));
    this.cartas.push(new Carta(cartaValor.quatro, naipeValor.espadas, 'quatro', 'espadas', '🂤', '4S'));
    this.cartas.push(new Carta(cartaValor.quatro, naipeValor.copas, 'quatro', 'copas', '🂴', '4H'));
    this.cartas.push(new Carta(cartaValor.quatro, naipeValor.paus, 'quatro', 'paus', '🃔', '4C'));
    this.cartas.push(new Carta(cartaValor.cinco, naipeValor.ouros, 'cinco', 'ouros', '🃅', '5D'));
    this.cartas.push(new Carta(cartaValor.cinco, naipeValor.espadas, 'cinco', 'espadas', '🂥', '5S'));
    this.cartas.push(new Carta(cartaValor.cinco, naipeValor.copas, 'cinco', 'copas', '🂵', '5H'));
    this.cartas.push(new Carta(cartaValor.cinco, naipeValor.paus, 'cinco', 'paus', '🃕', '5C'));
    this.cartas.push(new Carta(cartaValor.seis, naipeValor.ouros, 'seis', 'ouros', '🃆', '6D'));
    this.cartas.push(new Carta(cartaValor.seis, naipeValor.espadas, 'seis', 'espadas', '🂦', '6S'));
    this.cartas.push(new Carta(cartaValor.seis, naipeValor.copas, 'seis', 'copas', '🂶', '6H'));
    this.cartas.push(new Carta(cartaValor.seis, naipeValor.paus, 'seis', 'paus', '🃖', '6C'));
    this.cartas.push(new Carta(cartaValor.sete, naipeValor.ouros, 'sete', 'ouros', '🃇', '7D'));
    this.cartas.push(new Carta(cartaValor.sete, naipeValor.espadas, 'sete', 'espadas', '🂧', '7S'));
    this.cartas.push(new Carta(cartaValor.sete, naipeValor.copas, 'sete', 'copas', '🂷', '7H'));
    this.cartas.push(new Carta(cartaValor.sete, naipeValor.paus, 'sete', 'paus', '🃗', '7C'));
    this.cartas.push(new Carta(cartaValor.Q, naipeValor.ouros, 'Q', 'ouros', '🃍', 'QD'));
    this.cartas.push(new Carta(cartaValor.Q, naipeValor.espadas, 'Q', 'espadas', '🂭', 'QS'));
    this.cartas.push(new Carta(cartaValor.Q, naipeValor.copas, 'Q', 'copas', '🂽', 'QH'));
    this.cartas.push(new Carta(cartaValor.Q, naipeValor.paus, 'Q', 'paus', '🃝', 'QC'));
    this.cartas.push(new Carta(cartaValor.J, naipeValor.ouros, 'J', 'ouros', '🃋', 'JD'));
    this.cartas.push(new Carta(cartaValor.J, naipeValor.espadas, 'J', 'espadas', '🂫', 'JS'));
    this.cartas.push(new Carta(cartaValor.J, naipeValor.copas, 'J', 'copas', '🂻', 'JH'));
    this.cartas.push(new Carta(cartaValor.J, naipeValor.paus, 'J', 'paus', '🃛', 'JC'));
    this.cartas.push(new Carta(cartaValor.K, naipeValor.ouros, 'K', 'ouros', '🃎', 'KD'));
    this.cartas.push(new Carta(cartaValor.K, naipeValor.espadas, 'K', 'espadas', '🂮', 'KS'));
    this.cartas.push(new Carta(cartaValor.K, naipeValor.copas, 'K', 'copas', '🂾', 'KH'));
    this.cartas.push(new Carta(cartaValor.K, naipeValor.paus, 'K', 'paus', '🃞', 'KC'));
    this.cartas.push(new Carta(cartaValor.A, naipeValor.ouros, 'A', 'ouros', '🃁', 'AD'));
    this.cartas.push(new Carta(cartaValor.A, naipeValor.espadas, 'A', 'espadas', '🂡', 'AS'));
    this.cartas.push(new Carta(cartaValor.A, naipeValor.copas, 'A', 'copas', '🂱', 'AH'));
    this.cartas.push(new Carta(cartaValor.A, naipeValor.paus, 'A', 'paus', '🃑', 'AC'));
    this.cartas.push(new Carta(cartaValor.dois, naipeValor.ouros, 'dois', 'ouros', '🃂', '2D'));
    this.cartas.push(new Carta(cartaValor.dois, naipeValor.espadas, 'dois', 'espadas', '🂢', '2S'));
    this.cartas.push(new Carta(cartaValor.dois, naipeValor.copas, 'dois', 'copas', '🂲', '2H'));
    this.cartas.push(new Carta(cartaValor.dois, naipeValor.paus, 'dois', 'paus', '🃒', '2C'));
    this.cartas.push(new Carta(cartaValor.tres, naipeValor.ouros, 'tres', 'ouros', '🃃', '3D'));
    this.cartas.push(new Carta(cartaValor.tres, naipeValor.espadas, 'tres', 'espadas', '🂣', '3S'));
    this.cartas.push(new Carta(cartaValor.tres, naipeValor.copas, 'tres', 'copas', '🂳', '3H'));
    this.cartas.push(new Carta(cartaValor.tres, naipeValor.paus, 'tres', 'paus', '🃓', '3C'));
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
