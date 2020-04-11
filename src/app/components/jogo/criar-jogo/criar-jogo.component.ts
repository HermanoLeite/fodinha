import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'criar-jogo',
  templateUrl: './criar-jogo.component.html'
})
export class CriarJogoComponent {
  @Output() salvarJogo = new EventEmitter<string>()

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

  salvarNovoJogo() {
    this.salvarJogo.emit(this.jogoNome)
    this.fechar();
  }
}
