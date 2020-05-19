import { Component, Input, Output, EventEmitter } from '@angular/core';
import { JogadorDocumento } from 'src/app/models/jogadorDocumento.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'listar-jogadores',
  templateUrl: './listar-jogadores.component.html',
  styleUrls: ['./listar-jogadores.component.css']
})
export class ListarJogadoresComponent {
  @Output() removerJogador = new EventEmitter<JogadorDocumento>()

  @Input() jogadores: Observable<JogadorDocumento[]>;
  @Input() mostrarRemover: boolean;
}
