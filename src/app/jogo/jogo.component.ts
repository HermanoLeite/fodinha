import { JogoService } from './jogo.service';
import { config } from './collection.config';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Jogo } from './jogo.model';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-jogo',
  templateUrl: './jogo.component.html',
  styleUrls: ['./jogo.component.css']
})
export class JogoComponent implements OnInit {
  jogos: Observable<any[]>;
  jogoNome: string;
  editMode: boolean = false;
  jogoToEdit: any = {};

  constructor(private db: AngularFirestore, private jogoService: JogoService) { }

  edit(jogo) {
    console.log(jogo);
    this.jogoToEdit = jogo;
    this.editMode = true;
    this.jogoNome = jogo.nome;
  }

  saveJogo() {
    if (this.jogoNome !== null) {
      let jogo = {
          nome: this.jogoNome
      };
      if (!this.editMode) {
          console.log(jogo);
          this.jogoService.addJogo(jogo);
      } else {
          let jogoId = this.jogoToEdit.id;
          this.jogoService.updateJogo(jogoId, jogo);
      }
      this.editMode = false;
      this.jogoNome = "";
    }
  }

  deleteJogo(jogo) {
    let jogoId = jogo.id;
    this.jogoService.deleteJogo(jogoId);
  }
  ngOnInit() {
    this.jogos = this.db.collection(config.collection_endpoint).snapshotChanges()
    .pipe(map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data() as Jogo;
        console.log("atualizacao!! - " + JSON.stringify(data));
        const id = a.payload.doc.id;
        return { id, ...data };
      });
    }));
  }
}