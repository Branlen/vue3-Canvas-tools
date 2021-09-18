export class BFC{
  constructor(grid,diagonal = false,){
    this.grid = grid;
    this.diagonal = diagonal;
    this.initGrid(this.grid)
    this.result = []
    this.searchInfo =[]
  }
  initGrid(grid){
      grid.forEach(gridRow=>{
        gridRow.forEach(item => {
          item.parent = null;  
        });
      })
  }
  getBestResult(){

  }
  getSearchInfo(){

  }
  search(start,end){

  }
  neighbors(node){
    const res = [];
    const grid = this.grid;
    const {x,y} = node;
    // top
    if( grid[x-1]&& grid[x-1][y]&&grid[x-1][y].type!=='wall'){
      res.push(grid[x-1][y]);
    }
    // bottom
    if( grid[x+1]&& grid[x+1][y]&&grid[x+1][y].type!=='wall'){
      res.push(grid[x+1][y]);
    }
    // left
    if( grid[x]&& grid[x][y-1]&&grid[x][y-1].type!=='wall'){
      res.push(grid[x][y-1]);
    }
    // right
    if( grid[x]&& grid[x][y+1]&&grid[x][y+1].type!=='wall'){
      res.push(grid[x][y+1]);
    }
    if(this.diagonal){
      // top left
      if( grid[x-1]&& grid[x-1][y-1]&&grid[x-1][y-1].type!=='wall'){
        res.push(grid[x-1][y-1]);
      }
      // bottom left
      if( grid[x+1]&& grid[x+1][y-1]&&grid[x+1][y-1].type!=='wall'){
        res.push(grid[x+1][y-1]);
      }
      // top right
      if( grid[x-1]&& grid[x-1][y+1]&&grid[x-1][y+1].type!=='wall'){
        res.push(grid[x-1][y+1]);
      }
      // top left 
      if( grid[x+1]&& grid[x+1][y-1]&&grid[x+1][y-1].type!=='wall'){
        res.push(grid[x+1][y+1]);
      }
    }
    return res;
  }
}