import { Component, Input, Output, EventEmitter } from '@angular/core';
import { JogadorDocumento } from 'src/app/models/JogadorDocumento';
import { Observable } from 'rxjs';

@Component({
  selector: 'listar-jogadores',
  templateUrl: './listar-jogadores.component.html',
})
export class ListarJogadoresComponent {
  @Input() jogadores: Observable<JogadorDocumento[]>;
  @Input() mostrarRemover: boolean;

  @Output() removerJogador = new EventEmitter<JogadorDocumento>()

  remover(jogador) {
    this.removerJogador.emit(jogador)
  }
}
