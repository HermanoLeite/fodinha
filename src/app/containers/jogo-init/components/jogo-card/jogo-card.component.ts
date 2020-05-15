import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Status } from 'src/app/models/jogo.model';

@Component({
  selector: 'jogo-card',
  templateUrl: './jogo-card.component.html',
  styleUrls: ['./jogo-card.component.css']
})
export class JogoCardComponent {
  @Input() jogo: any
  @Input() selecionado: boolean

  getStatus(status: Status) {
    switch (status) {
      case Status.aguardandoJogadores: return "Aguardando Jogadores"
      case Status.jogando: return "Jogando"
      case Status.finalizado: return "Finalizado"
    }
  }
}
