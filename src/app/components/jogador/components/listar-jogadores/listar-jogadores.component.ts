import { Component, Input, Output, EventEmitter } from '@angular/core';
import { JogadorDocumento } from 'src/app/models/JogadorDocumento';
import { Observable } from 'rxjs';

@Component({
  selector: 'listar-jogadores',
  templateUrl: './listar-jogadores.component.html',
})
export class ListarJogadoresComponent {
  @Output() removerJogador = new EventEmitter<JogadorDocumento>()

  @Input() jogadores: Observable<JogadorDocumento[]>;
  @Input() mostrarRemover: boolean;
}
