import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'botao-comecar-jogo',
  templateUrl: './botao-comecar-jogo.component.html'
})
export class BotaoComecarJogoComponent {
  @Output() comecarJogo = new EventEmitter<void>()
  @Output() retornarAoJogo = new EventEmitter<void>()
  @Input() comecou: boolean
  @Input() removido: boolean

  comecar() {
    this.comecarJogo.emit();
  }

  retornar() {
    this.retornarAoJogo.emit();
  }
}
