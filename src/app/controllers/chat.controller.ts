import { Injectable } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';

@Injectable()
export class ChatController {
    constructor(private firebase: FirebaseService) { }

    mandaMensagem(jogoId, nome, mensagem) {
        const data = {
            nome,
            mensagem,
            criadoEm: Date.now()
        }
        this.firebase.mandaMensagem(jogoId, data)
    }

    buscaMensagens(jogoId) {
        return this.firebase.jogoStream(jogoId)
    }
}
