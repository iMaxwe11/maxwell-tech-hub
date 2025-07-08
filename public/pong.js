const canvas = document.getElementById("pongCanvas");
const ctx = canvas?.getContext("2d");
if (ctx) {
  let paddleHeight = 75, paddleWidth = 10;
  let paddleY = (canvas.height - paddleHeight) / 2;
  let ballX = canvas.width / 2, ballY = canvas.height / 2;
  let ballRadius = 10;
  let dx = 2, dy = 2;
  document.addEventListener("mousemove", (e) => {
    const relativeY = e.clientY - canvas.getBoundingClientRect().top;
    if (relativeY > 0 && relativeY < canvas.height) paddleY = relativeY - paddleHeight / 2;
  });
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#00f"; ctx.fillRect(0, paddleY, paddleWidth, paddleHeight);
    ctx.beginPath(); ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#fff"; ctx.fill(); ctx.closePath();
    ballX += dx; ballY += dy;
    if (ballY + dy < ballRadius || ballY + dy > canvas.height - ballRadius) dy = -dy;
    if (ballX + dx < paddleWidth) {
      if (ballY > paddleY && ballY < paddleY + paddleHeight) dx = -dx;
      else { ballX = canvas.width / 2; ballY = canvas.height / 2; dx = 2; dy = 2; }
    }
    if (ballX + dx > canvas.width - ballRadius) dx = -dx;
    requestAnimationFrame(draw);
  }
  draw();
}
