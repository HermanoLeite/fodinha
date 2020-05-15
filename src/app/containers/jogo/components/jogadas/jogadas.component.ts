import { Component, Input } from '@angular/core';

@Component({
  selector: 'jogadas',
  templateUrl: './jogadas.component.html',
})
export class JogadasComponent {
  @Input() jogadas;
}
