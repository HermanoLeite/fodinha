import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'mao-jogador',
  templateUrl: './mao-jogador.component.html'
})
export class MaoJogadorComponent {
  @Input() rodada: any;
  @Input() jogador: any;
  @Input() podeJogarCarta: boolean
  @Output() jogarCarta = new EventEmitter<boolean>()

  jogando: Boolean;

  async jogar(cartaIndex) {
    if (this.jogando) {
      return;
    }
    this.jogando = true;

    await this.jogarCarta.emit(cartaIndex)

    this.jogando = false;
  }
}
