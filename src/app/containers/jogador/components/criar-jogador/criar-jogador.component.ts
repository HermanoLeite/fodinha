import { Component, Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'criar-jogador',
  templateUrl: './criar-jogador.component.html',
  styleUrls: ['./criar-jogador.component.css']
})
export class CriarJogadorComponent {
  jogadorNome: string
  label: string = "Entrar"
  @Output() criarJogador = new EventEmitter<string>()

  async criar() {
    this.criarJogador.emit(this.jogadorNome)
  }
}
