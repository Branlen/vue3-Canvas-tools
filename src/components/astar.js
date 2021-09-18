import { BinaryHeap } from "./BinaryHeap";

import { NodeTypeValue } from "./util";

export class Astar {
  constructor(grid, start, end, diagonal = false, heuristic) {
    this.grid = grid;
    this.diagonal = !!diagonal;
    this.heuristic = heuristic || this.manhattan;
    this.start = start;
    this.end = end;
    this.searchInfo = [];
    this.path = [];
    this.initGrid();
  }
  initGrid() {
    const grid = this.grid;
  
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        let node = grid[i][j];
        node.f = 0;
        node.g = 0;
        node.h = 0;
        node.cost = grid[i][j].type;
        node.parent = null;
        node.visited = false;
        node.closed = false;
      }
    }
  }

  getBestResult() {
    return this.path;
  }
  getSearchInfo() {
    return this.searchInfo;
  }
  heap() {
    return new BinaryHeap((i) => i.f);
  }
  search() {
    //生成一个二叉堆
    const heap = this.heap();
    heap.push(this.start);
    this.searchInfo.push(this.start);
    while (heap.size() > 0) {
      const currentNode = heap.pop();

      while (currentNode === this.end) {
        var curr = currentNode;
        var ret = [];
        while (curr.parent) {
          ret.push(curr.parent);
          curr = curr.parent;
        }
        this.path = ret.reverse();
        return;
      }
      currentNode.closed = true;
      const neighbors = this.neighbors(currentNode);
      for (const neighbor of neighbors) {
        // 一定条件push到小叉堆

        if (neighbor.closed || neighbor.type === NodeTypeValue.WALL) {
          continue;
        }
        var gScore = currentNode.g + neighbor.cost;
        const beenVisited = neighbor.visited;

        if (!beenVisited || gScore < neighbor.g) {
          neighbor.parent = currentNode;
          neighbor.visited = true;
          neighbor.g = gScore;
          neighbor.h = this.heuristic(neighbor, this.end);
          neighbor.f = neighbor.g + neighbor.h;
          if (!beenVisited) {
            heap.push(neighbor);
            this.searchInfo.push(neighbor);
          } else {
            heap.rescoreElement(neighbor);
          }
        }
      }
    }
  }
  manhattan(pos0, pos1) {
    let d1 = Math.abs(pos0.x - pos1.x);
    let d2 = Math.abs(pos0.y - pos1.y);
    return d1 + d2;
  }
  neighbors(node) {
    const ret = [];
    const grid = this.grid;
    const i = node.x,
      j = node.y;
    if (grid[i - 1] && grid[i - 1][j]) {
      ret.push(grid[i - 1][j]);
    }
    if (grid[i + 1] && grid[i + 1][j]) {
      ret.push(grid[i + 1][j]);
    }
    if (grid[i] && grid[i][j + 1]) {
      ret.push(grid[i][j + 1]);
    }
    if (grid[i] && grid[i][j - 1]) {
      ret.push(grid[i][j - 1]);
    }
    if (this.diagonal) {
      if (grid[i - 1] && grid[i - 1][j - 1]) {
        ret.push(grid[i - 1][j + 1]);
      }
      if (grid[i + 1] && grid[i + 1][j + 1]) {
        ret.push(grid[i + 1][j + 1]);
      }
      if (grid[i - 1] && grid[i - 1][j + 1]) {
        ret.push(grid[i - 1][j + 1]);
      }
      if (grid[i + 1] && grid[i + 1][j - 1]) {
        ret.push(grid[i + 1][j - 1]);
      }
    }
    return ret;
  }
}
