import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Jogador } from 'src/app/models/jogador';
import { JogadorService } from '../../../service/jogador.service';

@Component({
  selector: 'botao-comecar-jogo',
  templateUrl: './botao-comecar-jogo.component.html'
})
export class BotaoComecarJogoComponent {
  @Input() jogadorDocId: string
  @Input() jogoId: string;
  @Input() jogadorAtual: Jogador;

  constructor(
    private jogadorService: JogadorService,
    private router: Router) {
  }

  async comecarJogo() {
    this.jogadorAtual.comecar = !this.jogadorAtual.comecar;
    this.jogadorService.updatejogador(this.jogadorAtual, this.jogoId);
    const todosJogadoresComecaram = await this.jogadorService.todosJogadoresComecaram(this.jogoId);

    if (todosJogadoresComecaram) {
      this.jogadorService.comecarJogo(this.jogoId);
      this.router.navigate(['jogo', this.jogoId]);
    }
  }

  retornarAoJogo() {
    this.jogadorAtual.removido = false;
    this.jogadorService.updatejogador(this.jogadorAtual, this.jogoId);
  }
}
