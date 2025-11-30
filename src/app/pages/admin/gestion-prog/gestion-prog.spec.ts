import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionProg } from './gestion-prog';

describe('GestionProg', () => {
  let component: GestionProg;
  let fixture: ComponentFixture<GestionProg>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionProg]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionProg);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
