import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoryDashboard } from './story-dashboard';

describe('StoryDashboard', () => {
  let component: StoryDashboard;
  let fixture: ComponentFixture<StoryDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoryDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoryDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
