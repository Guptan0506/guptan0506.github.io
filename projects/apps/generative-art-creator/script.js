const canvas = document.getElementById("artCanvas");
const ctx = canvas.getContext("2d");

const controls = {
    numShapes: document.getElementById("numShapes"),
    shapeType: document.getElementById("shapeType"),
    shapeSize: document.getElementById("shapeSize"),
    opacity: document.getElementById("opacity"),
    baseColor: document.getElementById("baseColor"),
    bgColor: document.getElementById("bgColor"),
    generate: document.getElementById("generateArt"),
    clear: document.getElementById("clearCanvas")
};

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function randomizeColor(baseColor) {
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);

    return `rgba(
        ${Math.min(255, r + (Math.random() - 0.5) * 60)},
        ${Math.min(255, g + (Math.random() - 0.5) * 60)},
        ${Math.min(255, b + (Math.random() - 0.5) * 60)},
        ${controls.opacity.value}
    )`;
}

function drawArt() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = controls.bgColor.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < controls.numShapes.value; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * controls.shapeSize.value + 5;
        const color = randomizeColor(controls.baseColor.value);

        ctx.fillStyle = color;
        ctx.beginPath();

        switch (controls.shapeType.value) {
            case "circle":
                ctx.arc(x, y, size / 2, 0, Math.PI * 2);
                ctx.fill();
                break;

            case "square":
                ctx.fillRect(x, y, size, size);
                break;

            case "line":
                ctx.moveTo(x, y);
                ctx.lineTo(x + size, y + size);
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.stroke();
                break;

            case "triangle":
                ctx.moveTo(x, y);
                ctx.lineTo(x + size, y);
                ctx.lineTo(x + size / 2, y - size);
                ctx.closePath();
                ctx.fill();
                break;
        }
    }
}

function animate() {
    canvas.style.opacity = 0.4;
    setTimeout(() => {
        drawArt();
        canvas.style.opacity = 1;
    }, 120);
}

controls.generate.addEventListener("click", animate);
controls.clear.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
animate();
