import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class QueensSolverService {
  // resolva o problema das N rainhas
  solve(n: number): number[][] {
    // crie uma matriz com todas as posições inicialmente vazias
    let board = new Array(n).fill(null).map(() => new Array(n).fill(0));

    // tente colocar uma rainha em cada coluna
    return this.placeQueens(board, 0);
  }

  // recursivamente tente colocar uma rainha em cada coluna da linha atual
  private placeQueens(board: number[][], col: number): number[][] | null {
    // se chegamos ao final da tabela, retornamos a solução
    if (col === board.length) {
      return board;
    }

    // tente colocar uma rainha em cada linha da coluna atual
    for (let i = 0; i < board.length; i++) {
      // verifique se a rainha pode ser colocada nessa posição
      if (this.isValid(board, i, col)) {
        // coloque a rainha nessa posição
        board[i][col] = 1;

        // tente colocar uma rainha na próxima coluna
        const solution = this.placeQueens(board, col + 1);
        if (solution) {
          return solution;
        }

        // se não houver solução, remova a rainha da posição atual
        board[i][col] = 0;
      }
    }

    // se não houver solução para essa coluna, retorne null
    return null;
  }

  // verifique se é possível colocar uma rainha na linha e coluna especificadas
  private isValid(board: number[][], row: number, col: number): boolean {
    // verifique se há alguma rainha na mesma linha ou na mesma diagonal
    for (let i = 0; i < col; i++) {
      if (board[row][i] === 1 ||
        row - i === col - board[i][col] ||
        row + i === col + board[i][col]) {
        return false;
      }
    }
    return true;
  }
}
