import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';

@Component({
    selector: 'jogo-header',
    templateUrl: './jogo-header.component.html',
})
export class JogoHeaderComponent {
    title = 'fodinha';
    constructor(private storageService: StorageService, private router: Router) {
    }

    sair() {
        this.storageService.clear()
        this.router.navigate(['/'])
    }
}
