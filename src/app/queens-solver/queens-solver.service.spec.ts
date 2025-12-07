import { TestBed } from '@angular/core/testing';

import { QueensSolverService } from './queens-solver.service';


describe('QueensSolverService', () => {
  let service: QueensSolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QueensSolverService);
  });

  it('should return null for n = 6', () => {
    expect(service.solve(6)).toBeNull();
  });

  // it('should solve for n = 4', () => {
  //   const expectedResult = [[1, 0, 0, 0],
  //   [0, 0, 1, 0],
  //   [0, 0, 0, 1],
  //   [0, 1, 0, 0]
  //   ];
  //   expect(service.solve(4)).toEqual(expectedResult);
  // });

  // it('should solve for n = 5', () => {
  //   const expectedResult = [[0, 1, 0, 0, 0],
  //   [0, 0, 0, 1, 0],
  //   [1, 0, 0, 0, 0],
  //   [0, 0, 0, 0, 1],
  //   [0, 0, 1, 0, 0]
  //   ];
  //   expect(service.solve(5)).toEqual(expectedResult);
  // });
});
