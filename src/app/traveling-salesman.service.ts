// import { Injectable } from '@angular/core';
// import * as tf from '@tensorflow/tfjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class TravelingSalesmanService {
//   model: tf.LayersModel;

//   constructor() { }

//   // Método para treinar o modelo de rede neural
//   async trainModel(cities: number[][], distances: number[][]) {
//     // Pré-processa os dados de treinamento
//     const X = tf.tensor2d(cities);
//     const y = tf.tensor1d(distances, 'int32');

//     // Define o modelo da rede neural
//     this.model = tf.sequential();
//     this.model.add(tf.layers.dense({ units: 10, inputShape: [X.shape[1]], activation: 'relu' }));
//     this.model.add(tf.layers.dense({ units: y.shape[0], activation: 'softmax' }));

//     // Compila o modelo
//     this.model.compile({ loss: 'categoricalCrossentropy', optimizer: 'adam', metrics: ['accuracy'] });

//     // Treina o modelo
//     const history = await this.model.fit(X, y, { epochs: 10, batchSize: 32 });
//     console.log(history.history.loss[0]);
//   }

//   // Método para fazer previsões com o modelo treinado
//   async predict(cities: number[][]) {
//     // Pré-processa os dados de teste
//     const X = tf.tensor2d(cities);

//     // Faz previsões com o modelo treinado
//     const predictions = this.model.predict(X) as tf.Tensor;

//     // Decodifica as previsões e retorna a rota mais curta prevista
//     const shortestRoute = predictions.argMax(-1).dataSync();
//     return Array.from(shortestRoute);
//   }
// }
