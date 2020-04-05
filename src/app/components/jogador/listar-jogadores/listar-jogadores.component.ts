import { Component, Input, Output, EventEmitter } from '@angular/core';
import { JogadorDocument } from 'src/app/models/jogadorDocument';
import { Observable } from 'rxjs';

@Component({
  selector: 'listar-jogadores',
  templateUrl: './listar-jogadores.component.html',
})
export class ListarJogadoresComponent {
  @Input() jogadores: Observable<JogadorDocument[]>;
  @Input() mostrarRemover: boolean;

  @Output() removerJogador = new EventEmitter<JogadorDocument>()

  remover(jogador) {
    this.removerJogador.emit(jogador)
  }
}
