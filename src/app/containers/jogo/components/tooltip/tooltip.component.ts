import { Component } from "@angular/core";

@Component({
    selector: 'tooltip',
    template: `<div class="help tooltip">
                <span>?</span>
                <span class="tooltiptext"><ng-content></ng-content></span>
               </div>`,
    styleUrls: ['tooltip.component.css']
})

export class TooltipComponent { }
