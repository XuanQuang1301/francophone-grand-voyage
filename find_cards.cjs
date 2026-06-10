const fs = require('fs');
const PNG = require('pngjs').PNG;

fs.createReadStream('public/world_map.png')
  .pipe(new PNG())
  .on('parsed', function() {
    let w = this.width;
    let h = this.height;
    // create a boolean map of white pixels
    let isWhite = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let idx = (w * y + x) << 2;
        let r = this.data[idx];
        let g = this.data[idx+1];
        let b = this.data[idx+2];
        if (r > 240 && g > 240 && b > 240) {
          isWhite[y * w + x] = 1;
        }
      }
    }
    
    // find connected components
    let visited = new Uint8Array(w * h);
    let components = [];
    let q = new Int32Array(w * h * 2);
    
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (isWhite[y * w + x] && !visited[y * w + x]) {
          let minX = x, maxX = x, minY = y, maxY = y;
          let head = 0, tail = 0;
          q[tail++] = x;
          q[tail++] = y;
          visited[y * w + x] = 1;
          let area = 0;
          
          while (head < tail) {
            let cx = q[head++];
            let cy = q[head++];
            area++;
            if (cx < minX) minX = cx;
            if (cx > maxX) maxX = cx;
            if (cy < minY) minY = cy;
            if (cy > maxY) maxY = cy;
            
            // neighbors
            let nx, ny;
            nx = cx + 1; ny = cy;
            if (nx < w && isWhite[ny * w + nx] && !visited[ny * w + nx]) { visited[ny * w + nx] = 1; q[tail++] = nx; q[tail++] = ny; }
            nx = cx - 1; ny = cy;
            if (nx >= 0 && isWhite[ny * w + nx] && !visited[ny * w + nx]) { visited[ny * w + nx] = 1; q[tail++] = nx; q[tail++] = ny; }
            nx = cx; ny = cy + 1;
            if (ny < h && isWhite[ny * w + nx] && !visited[ny * w + nx]) { visited[ny * w + nx] = 1; q[tail++] = nx; q[tail++] = ny; }
            nx = cx; ny = cy - 1;
            if (ny >= 0 && isWhite[ny * w + nx] && !visited[ny * w + nx]) { visited[ny * w + nx] = 1; q[tail++] = nx; q[tail++] = ny; }
          }
          
          if (area > 1000) {
            components.push({ minX, maxX, minY, maxY, area,
              cx: ((minX + maxX) / 2 / w * 100).toFixed(2),
              cy: ((minY + maxY) / 2 / h * 100).toFixed(2),
              w: ((maxX - minX) / w * 100).toFixed(2),
              h: ((maxY - minY) / h * 100).toFixed(2)
            });
          }
        }
      }
    }
    
    components.sort((a, b) => b.area - a.area);
    console.log(components.slice(0, 15));
  });
