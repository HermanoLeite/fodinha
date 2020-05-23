import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'botao-comecar-jogo',
  template: `<jogo-button  (acao)="acao()" [label]="label"></jogo-button>
  <span>Depois que todo mundo entrar, clique em começar</span>`,
})
export class BotaoComecarJogoComponent {
  @Output() comecarJogo = new EventEmitter<void>()
  @Output() retornarAoJogo = new EventEmitter<void>()
  @Input() comecou: boolean
  @Input() removido: boolean

  label: string
  acao: Function

  ngOnChanges() {
    this.label = this.getLabel()
    this.acao = this.getAcao()
  }

  getLabel() {
    if (this.removido) return 'Retornar'
    if (this.comecou) return 'Desistir'
    return 'Começar'
  }

  getAcao() {
    return this.removido ? this.retornar : this.comecar
  }

  comecar() {
    this.comecarJogo.emit();
  }

  retornar() {
    this.retornarAoJogo.emit();
  }
}
