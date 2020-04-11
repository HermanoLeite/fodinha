import { Component, Input } from '@angular/core';

@Component({
  selector: 'ganhador',
  templateUrl: './ganhador.component.html',
})
export class GanhadorComponent {
  @Input() vencedor: string;
  constructor() { }
}
