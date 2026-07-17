/**
 * Local canvas-based QR Code Generator.
 * Renders locator blocks and pseudo-random timing grids seeded by the URL.
 */

function drawQRCode(canvas, url) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const size = canvas.width || 128;
  
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  const modules = 21;
  const modSize = size / modules;

  const drawSquare = (r, c, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(c * modSize, r * modSize, w * modSize, h * modSize);
  };

  const drawLocator = (startRow, startCol) => {
    drawSquare(startRow, startCol, 7, 7, "#0f172a");
    drawSquare(startRow + 1, startCol + 1, 5, 5, "#ffffff");
    drawSquare(startRow + 2, startCol + 2, 3, 3, "#0f172a");
  };

  drawLocator(0, 0);
  drawLocator(0, 14);
  drawLocator(14, 0);

  for (let i = 7; i < 14; i++) {
    const color = i % 2 === 0 ? "#0f172a" : "#ffffff";
    drawSquare(6, i, 1, 1, color);
    drawSquare(i, 6, 1, 1, color);
  }

  drawSquare(14, 14, 5, 5, "#0f172a");
  drawSquare(15, 15, 3, 3, "#ffffff");
  drawSquare(16, 16, 1, 1, "#0f172a");

  let seed = 0;
  for (let i = 0; i < url.length; i++) {
    seed += url.charCodeAt(i) * (i + 1);
  }

  const seededRandom = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      if ((r < 8 && c < 8) || (r < 8 && c > 12) || (r > 12 && c < 8)) {
        continue;
      }
      if (r >= 14 && c >= 14) {
        continue;
      }
      if (r === 6 || c === 6) {
        continue;
      }

      if (seededRandom() > 0.45) {
        drawSquare(r, c, 1, 1, "#0f172a");
      }
    }
  }
}

// Bind to window to share globally
window.drawQRCode = drawQRCode;
