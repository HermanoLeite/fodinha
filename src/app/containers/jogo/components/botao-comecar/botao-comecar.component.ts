import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Etapa } from 'src/app/models/jogo.model';

@Component({
  selector: 'botao-comecar',
  templateUrl: './botao-comecar.component.html',
})
export class BotaoComecarComponent {
  @Input() etapa: Etapa;
  @Output() comecarRodada = new EventEmitter<void>()

  label: string = "Entregar Cartas"

  etapaEmbaralhar() {
    return this.etapa === Etapa.embaralhar;
  }

  comecar() {
    this.comecarRodada.emit();
  }
}
