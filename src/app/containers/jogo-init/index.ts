import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { Observable } from 'rxjs'
import { Status, Jogo } from '../../models/jogo.model'
import { JogoController } from '../../controllers/jogo.controller'

@Component({
  selector: 'app-jogo-init',
  templateUrl: './index.html',
  styleUrls: ['./index.css']
})
export class JogoInitComponent implements OnInit {
  jogos: Observable<Jogo[]>
  textoBotao: string = "Novo Jogo"
  constructor(private router: Router, private jogoController: JogoController) {
  }

  entrarJogo(jogo) {
    if (jogo.status === Status.finalizado) {
      this.router.navigate(['jogo', jogo.id])
    }
    else {
      this.router.navigate(['jogador', jogo.id])
    }
  }

  removerJogo(jogoId) {
    this.jogoController.deletarJogo(jogoId)
  }

  async criarJogo() {
    const jogoRef = await this.jogoController.novoJogo()
    this.router.navigate(['jogador', jogoRef.id])
  }

  ngOnInit() {
    this.jogos = this.jogoController.jogosStream()
  }
}
