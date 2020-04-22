import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Status } from 'src/app/models/Jogo';
import { Observable } from 'rxjs';

@Component({
  selector: 'listar-jogos',
  templateUrl: './listar-jogos.component.html',
  styleUrls: ['./listar-jogos.component.css']
})
export class ListarJogosComponent {
  @Input() jogos: Observable<any>;
  @Output() removerJogo = new EventEmitter<string>()
  @Output() entrarJogo = new EventEmitter<any>()

  getStatus(status: Status) {
    switch (status) {
      case Status.aguardandoJogadores: return "Aguardando Jogadores"
      case Status.jogando: return "Jogando"
      case Status.finalizado: return "Finalizado"
    }
  }
}
