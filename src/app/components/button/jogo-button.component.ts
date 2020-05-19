import { Component, EventEmitter, Output, Input } from '@angular/core';

@Component({
    selector: 'jogo-button',
    templateUrl: './jogo-button.component.html',
})
export class JogoButtonComponent {
    @Input() label: string
    @Output() acao = new EventEmitter<string>()

}
