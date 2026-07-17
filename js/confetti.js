/**
 * Confetti Canvas particle overlay emitter.
 * Sequentially structured to support CORS-free file:// execution.
 */

function startConfetti() {
  let canvas = document.getElementById("confetti-canvas-overlay");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "confetti-canvas-overlay";
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 9999;
    `;
    document.body.appendChild(canvas);
  }

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ["#0ea5e9", "#38bdf8", "#a855f7", "#c084fc", "#10b981", "#34d399", "#f59e0b", "#fbbf24"];
  const particles = [];

  for (let i = 0; i < 120; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 5 + 4,
      d: Math.random() * canvas.height,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngleIncremental: Math.random() * 0.07 + 0.02,
      tiltAngle: 0
    });
  }

  let animationFrameId = null;
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, idx) => {
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
      p.x += Math.sin(p.tiltAngle);
      p.tilt = Math.sin(p.tiltAngle - idx / 3) * 15;

      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      ctx.stroke();
    });

    updateParticles();
  };

  const updateParticles = () => {
    let remaining = 0;
    particles.forEach((p) => {
      if (p.y < canvas.height + 20) {
        remaining++;
      }
    });

    if (remaining > 0) {
      animationFrameId = requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.remove();
    }
  };

  draw();
}

// Bind to window to share globally
window.startConfetti = startConfetti;
