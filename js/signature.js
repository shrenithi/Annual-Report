/**
 * Digital Signature Pad utility.
 * Sequentially structured to support CORS-free file:// execution.
 */

function initSignaturePad(canvas) {
  if (!canvas) return null;
  const ctx = canvas.getContext("2d");
  let drawing = false;
  let lastX = 0;
  let lastY = 0;

  ctx.strokeStyle = "#0284c7";
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.lineWidth = 3;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const getCoordinates = (e) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDrawing = (e) => {
    drawing = true;
    const coords = getCoordinates(e);
    lastX = coords.x;
    lastY = coords.y;
    e.preventDefault();
  };

  const draw = (e) => {
    if (!drawing) return;
    const coords = getCoordinates(e);
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    
    lastX = coords.x;
    lastY = coords.y;
    e.preventDefault();
  };

  const stopDrawing = () => {
    drawing = false;
  };

  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDrawing);
  canvas.addEventListener("mouseleave", stopDrawing);

  canvas.addEventListener("touchstart", startDrawing, { passive: false });
  canvas.addEventListener("touchmove", draw, { passive: false });
  canvas.addEventListener("touchend", stopDrawing);

  return {
    clear: () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
    save: () => {
      return canvas.toDataURL("image/png");
    }
  };
}

function generateTypedSignature(canvas, name, styleFont = "cursive") {
  if (!canvas) return "";
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#1e3a8a";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `italic bold 28px ${styleFont}`;
  
  ctx.fillText(name, w / 2, h / 2 - 5);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "10px sans-serif";
  ctx.fillText(`Digitally verified: ${new Date().toLocaleDateString()}`, w / 2, h - 15);

  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(10, h - 25);
  ctx.lineTo(w - 10, h - 25);
  ctx.stroke();
  ctx.setLineDash([]);

  return canvas.toDataURL("image/png");
}

// Bind to window to share globally
window.initSignaturePad = initSignaturePad;
window.generateTypedSignature = generateTypedSignature;
