import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Jogador } from 'src/app/containers/jogador/jogador.model';
import { AngularFirestore } from '@angular/fire/firestore';
import { JogadorService } from '../../../service/jogador.service';

import { collections } from '../../../context';

import { map } from 'rxjs/operators';
import { Jogo } from 'src/app/models/jogo';
import { Status } from 'src/app/containers/jogo/jogo.status';

@Component({
  selector: 'botao-comecar-jogo',
  templateUrl: './botao-comecar-jogo.component.html'
})
export class BotaoComecarJogoComponent implements OnInit {
  @Input() jogadorDocId: string
  @Input() jogoId: string;
  @Input() jogadorAtual: Jogador;

  constructor(
    private db: AngularFirestore,
    private jogadorService: JogadorService,
    private router: Router) {
  }

  async comecarJogo() {
    this.jogadorAtual.comecar = !this.jogadorAtual.comecar;
    this.jogadorService.updatejogador(this.jogadorDocId, this.jogadorAtual, this.jogoId);
    const todosJogadoresComecaram = await this.jogadorService.todosJogadoresComecaram(this.jogoId);

    if (todosJogadoresComecaram) {
      this.jogadorService.comecarJogo(this.jogoId);
      this.router.navigate(['jogo', this.jogoId]);
    }
  }

  retornarAoJogo() {
    this.jogadorAtual.removido = false;
    this.jogadorService.updatejogador(this.jogadorDocId, this.jogadorAtual, this.jogoId);
  }

  ngOnInit() {
    var jogadorDoc = this.db.collection(collections.jogo).doc(this.jogoId);
    jogadorDoc.snapshotChanges().pipe(
      map(a => {
        const data = a.payload.data() as Jogo;
        const id = a.payload.id;

        if (this.jogadorDocId && data.status === Status.jogando)
          this.router.navigate(['jogo', this.jogoId]);

        return { id, ...data };
      })
    ).subscribe();
  }
}
