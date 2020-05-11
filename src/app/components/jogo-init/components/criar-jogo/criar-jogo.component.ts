import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'criar-jogo',
  templateUrl: './criar-jogo.component.html'
})
export class CriarJogoComponent {
  @Output() criarJogo = new EventEmitter<string>()
  iniciar() {
    this.criarJogo.emit()
  }
}
