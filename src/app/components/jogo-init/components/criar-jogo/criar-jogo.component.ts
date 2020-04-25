import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'criar-jogo',
  templateUrl: './criar-jogo.component.html'
})
export class CriarJogoComponent {
  @Output() criarJogo = new EventEmitter<string>()

  criandoJogo: Boolean = false;
  jogoNome: string;

  iniciar() {
    this.criandoJogo = true;
    this.jogoNome = null;
  }

  fechar() {
    this.criandoJogo = false;
    this.jogoNome = null;
  }

  criar() {
    this.criarJogo.emit(this.jogoNome)
    this.fechar();
  }
}
