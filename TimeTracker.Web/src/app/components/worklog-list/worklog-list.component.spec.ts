import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorklogListComponent } from './worklog-list.component';

describe('WorklogListComponent', () => {
  let component: WorklogListComponent;
  let fixture: ComponentFixture<WorklogListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorklogListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorklogListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
