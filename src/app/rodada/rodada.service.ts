import { config } from '../collection.config';
import { Rodada } from './rodada.model';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';

@Injectable()
export class RodadaService {
    rodadas: AngularFirestoreCollection<Rodada>;
    private rodadasDoc: AngularFirestoreDocument<Rodada>;
  
    constructor(private db: AngularFirestore) { 
        this.rodadas = db.collection(config.rodadaDB);
    }

    addrodada(rodada) {
        this.rodadas.add(rodada);
    }
}

