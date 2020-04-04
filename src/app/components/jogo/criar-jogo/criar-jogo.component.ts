import { Component } from '@angular/core';
import { JogoService } from '../../../service/jogo.service';

@Component({
  selector: 'criar-jogo',
  templateUrl: './criar-jogo.component.html'
})
export class CriarJogoComponent {
  criandoJogo: Boolean = false;
  jogoNome: string;
  constructor(private jogoService: JogoService) { }

  iniciar() {
    this.criandoJogo = true;
    this.jogoNome = null;
  }

  cancelar() {
    this.criandoJogo = false;
    this.jogoNome = null;
  }

  salvarNovoJogo() {
    if (this.jogoNome !== null) {
      this.jogoService.novoJogo(this.jogoNome);
    }
    this.cancelar();
  }
}
