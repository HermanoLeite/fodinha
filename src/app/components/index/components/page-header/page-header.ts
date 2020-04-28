import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';

@Component({
    selector: 'page-header',
    templateUrl: './page-header.html',
    styleUrls: ['./page-header.css'],
})
export class PageHeaderComponent {
    title = 'fodinha';
    constructor(private storageService: StorageService, private router: Router) {
    }

    sairDoJogo() {
        this.storageService.clear()
        this.router.navigate(['/'])
    }
}
