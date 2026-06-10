const fs = require('fs');
const PNG = require('pngjs').PNG;

fs.createReadStream('public/world_map.png')
  .pipe(new PNG())
  .on('parsed', function() {
    let w = this.width;
    let h = this.height;
    
    // Sea color is roughly top-left pixel
    let seaR = this.data[0];
    let seaG = this.data[1];
    let seaB = this.data[2];
    console.log("Sea color:", seaR, seaG, seaB);
    
    let isCard = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let idx = (w * y + x) << 2;
        let r = this.data[idx];
        let g = this.data[idx+1];
        let b = this.data[idx+2];
        
        let d = Math.abs(r - seaR) + Math.abs(g - seaG) + Math.abs(b - seaB);
        if (d > 50) { // significantly different from sea
          isCard[y * w + x] = 1;
        }
      }
    }
    
    // We expect cards to be in row 1 (y ~ 40%) and row 2 (y ~ 75%)
    // Let's do a horizontal projection (sum of card pixels in each column) 
    // for row 1 to find the cx of the 5 cards.
    let row1Y = Math.floor(h * 0.45);
    let row1Height = Math.floor(h * 0.20); // sample a band
    
    let projX = new Int32Array(w);
    for (let x = 0; x < w; x++) {
      for (let y = row1Y - row1Height/2; y < row1Y + row1Height/2; y++) {
         if (isCard[y * w + x]) projX[x]++;
      }
    }
    
    // Find peaks and valleys in projX to locate the 5 cards
    let inCardRange = false;
    let start = 0;
    let cards = [];
    for (let x = 0; x < w; x++) {
       if (projX[x] > row1Height * 0.2 && !inCardRange) {
          inCardRange = true;
          start = x;
       } else if (projX[x] <= row1Height * 0.2 && inCardRange) {
          inCardRange = false;
          if (x - start > 50) { // valid card width
             cards.push({ start, end: x, cx: (start+x)/2, cxPercent: ((start+x)/2)/w*100, wPercent: (x-start)/w*100 });
          }
       }
    }
    console.log("Row 1 cards:", cards);

    let row2Y = Math.floor(h * 0.75);
    let projX2 = new Int32Array(w);
    for (let x = 0; x < w; x++) {
      for (let y = row2Y - row1Height/2; y < row2Y + row1Height/2; y++) {
         if (isCard[y * w + x]) projX2[x]++;
      }
    }
    inCardRange = false;
    let cards2 = [];
    for (let x = 0; x < w; x++) {
       if (projX2[x] > row1Height * 0.2 && !inCardRange) {
          inCardRange = true;
          start = x;
       } else if (projX2[x] <= row1Height * 0.2 && inCardRange) {
          inCardRange = false;
          if (x - start > 50) { 
             cards2.push({ start, end: x, cx: (start+x)/2, cxPercent: ((start+x)/2)/w*100, wPercent: (x-start)/w*100 });
          }
       }
    }
    console.log("Row 2 cards:", cards2);
    
    // Let's also do a vertical projection for the first card to find its Y bounds
    if (cards.length > 0) {
       let c1 = cards[0];
       let projY = new Int32Array(h);
       for(let y=0; y<h; y++) {
          for(let x=c1.start; x<c1.end; x++) {
             if(isCard[y*w + x]) projY[y]++;
          }
       }
       let inY = false;
       let startY = 0;
       let yBounds = [];
       for(let y=0; y<h; y++) {
          if(projY[y] > (c1.end - c1.start) * 0.2 && !inY) {
             inY = true;
             startY = y;
          } else if (projY[y] <= (c1.end - c1.start) * 0.2 && inY) {
             inY = false;
             if (y - startY > 50) {
                yBounds.push({startY, endY: y, cyPercent: ((startY+y)/2)/h*100, hPercent: (y-startY)/h*100});
             }
          }
       }
       console.log("Card 1 Y bounds:", yBounds);
    }
  });
