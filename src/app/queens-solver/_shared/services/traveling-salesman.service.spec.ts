// import { TestBed } from '@angular/core/testing';
// import { TravelingSalesmanService } from './traveling-salesman.service';
// import * as tf from '@tensorflow/tfjs';

// describe('TravelingSalesmanService', () => {
//   let service: TravelingSalesmanService;

//   beforeEach(() => {
//     TestBed.configureTestingModule({});
//     service = TestBed.inject(TravelingSalesmanService);
//   });

//   it('should be created', () => {
//     expect(service).toBeTruthy();
//   });

//   it('should train the model', async () => {
//     // Define os dados de treinamento
//     const cities = [[0, 1, 2], [1, 0, 2], [2, 1, 0]];
//     const distances = [1, 2, 3];

//     // Treina o modelo
//     await service.trainModel(cities, distances);

//     // Verifica se o modelo foi criado corretamente
//     expect(service.model).toBeTruthy();
//     expect(service.model.layers.length).toEqual(2);
//   });

//   it('should make predictions', async () => {
//     // Define os dados de treinamento
//     const cities = [[0, 1, 2], [1, 0, 2], [2, 1, 0]];
//     const distances = [1, 2, 3];

//     // Treina o modelo
//     await service.trainModel(cities, distances);

//     // Define os dados de teste
//     const testCities = [[0, 1, 2], [1, 0, 2]];

//     // Faz previsões com o modelo treinado
//     const predictions = await service.predict(testCities);

//     // Verifica se as previsões estão corretas
//     expect(predictions).toEqual([0, 1]);
//   });
// });
