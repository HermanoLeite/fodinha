import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JogadaComponent } from './jogada.component';

describe('JogadaComponent', () => {
  let component: JogadaComponent;
  let fixture: ComponentFixture<JogadaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JogadaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JogadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
