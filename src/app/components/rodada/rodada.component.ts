import { RodadaService } from './rodada.service';
import { config } from '../../collection.config';
import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Rodada } from './rodada.model';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-rodada',
  templateUrl: './rodada.component.html'
})
export class RodadaComponent implements OnInit {
  rodadas: Observable<any[]>;
  rodadaNome: string;
  @Input() name: string;
  
  constructor(private db: AngularFirestore, private rodadaService: RodadaService) { }

  saverodada() {
    if (this.rodadaNome !== null) {
      let rodada = {
          nome: this.rodadaNome
      };
      console.log(rodada);
      this.rodadaService.addrodada(rodada);
      this.rodadaNome = "";
    }
  }

  ngOnInit() {
    this.rodadas = this.db.collection(config.rodadaDB).snapshotChanges()
    .pipe(map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data() as Rodada;
        console.log("atualizacao!! - " + JSON.stringify(data));
        const id = a.payload.doc.id;
        return { id, ...data };
      });
    }));
  }
}