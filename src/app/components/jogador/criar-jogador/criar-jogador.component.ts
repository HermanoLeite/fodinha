import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'criar-jogador',
  templateUrl: './criar-jogador.component.html'
})
export class CriarJogadorComponent {
  jogadorNome: string;
  @Output() criarJogador = new EventEmitter<string>();

  constructor() {
  }

  async criar() {
    this.criarJogador.emit(this.jogadorNome);
  }
}
