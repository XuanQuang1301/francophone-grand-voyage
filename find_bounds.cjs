const fs = require('fs');
const PNG = require('pngjs').PNG;

fs.createReadStream('public/world_map.png')
  .pipe(new PNG({ filterType: 4 }))
  .on('parsed', function() {
    let y = Math.floor(1024 * 0.35); // 35% down
    let bounds = [];
    let inCard = false;
    let startX = 0;
    
    for (let x = 0; x < this.width; x++) {
      let idx = (this.width * y + x) << 2;
      let r = this.data[idx];
      let g = this.data[idx+1];
      let b = this.data[idx+2];
      
      // Cards have white border/background #FFFFFF
      let isWhite = (r > 230 && g > 230 && b > 230);
      
      if (isWhite && !inCard) {
        inCard = true;
        startX = x;
      } else if (!isWhite && inCard) {
        let isEnd = true;
        for(let i = 1; i < 30; i++) {
           if(x+i >= this.width) break;
           let idx2 = (this.width * y + (x+i)) << 2;
           if (this.data[idx2] > 230 && this.data[idx2+1] > 230 && this.data[idx2+2] > 230) {
              isEnd = false;
              break;
           }
        }
        if (isEnd) {
           inCard = false;
           bounds.push({ startX, endX: x, w: x - startX, cxPercent: ((startX + x)/2)/this.width*100, wPercent: (x - startX)/this.width*100 });
        }
      }
    }
    console.log("Row 1 (y=" + y + "):", bounds);

    y = Math.floor(1024 * 0.72); // 72% down for row 2
    bounds = [];
    inCard = false;
    startX = 0;
    for (let x = 0; x < this.width; x++) {
      let idx = (this.width * y + x) << 2;
      let r = this.data[idx];
      let g = this.data[idx+1];
      let b = this.data[idx+2];
      let isWhite = (r > 230 && g > 230 && b > 230);
      if (isWhite && !inCard) {
        inCard = true;
        startX = x;
      } else if (!isWhite && inCard) {
        let isEnd = true;
        for(let i = 1; i < 30; i++) {
           if(x+i >= this.width) break;
           let idx2 = (this.width * y + (x+i)) << 2;
           if (this.data[idx2] > 230 && this.data[idx2+1] > 230 && this.data[idx2+2] > 230) {
              isEnd = false;
              break;
           }
        }
        if (isEnd) {
           inCard = false;
           bounds.push({ startX, endX: x, w: x - startX, cxPercent: ((startX + x)/2)/this.width*100, wPercent: (x - startX)/this.width*100 });
        }
      }
    }
    console.log("Row 2 (y=" + y + "):", bounds);
  });
