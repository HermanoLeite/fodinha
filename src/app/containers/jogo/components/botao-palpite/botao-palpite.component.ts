import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Etapa } from 'src/app/models/jogo.model';

@Component({
  selector: 'botao-palpite',
  templateUrl: './botao-palpite.component.html',
  styleUrls: ['./botao-palpite.component.css'],
})
export class BotaoPalpiteComponent {
  @Input() etapa: Etapa;
  @Input() quantidadeCartas: number;
  @Output() enviarPalpite = new EventEmitter<number>()
  public palpites: Array<number>;

  ngOnChanges() {
    this.palpites = [].constructor(this.quantidadeCartas)
  }

  etapaPalpite(): boolean {
    return this.etapa === Etapa.palpite;
  }

  palpite(palpite: number): void {
    this.enviarPalpite.emit(palpite);
  }
}
