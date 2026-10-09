/* ---------- settings ---------- */
// 10 Aug 2026, 10:53 PM Philippine time (+08:00), so the count is the same on any device
const ANNIVERSARY = new Date("2026-08-10T22:53:00+08:00");

/* ---------- postmark date ---------- */
const now = new Date();
document.getElementById("pmDay").textContent =
  now.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).toUpperCase();
document.getElementById("pmYear").textContent = now.getFullYear();

/* ---------- live counter ---------- */
const daysEl = document.getElementById("days");
function tick() {
  const ms = Date.now() - ANNIVERSARY;
  const d = Math.floor(ms / 86400000);
  const h = Math.floor(ms / 3600000) % 24;
  const m = Math.floor(ms / 60000) % 60;
  daysEl.innerHTML =
    `<b>${d}</b> days <b>${h}</b> hrs <b>${m}</b> min of us<br>since 10 August 2026`;
}
tick();
setInterval(tick, 30000);

/* ---------- elements ---------- */
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const envelope = document.getElementById("envelope");
const envWrap = document.getElementById("envWrap");
const letter = document.getElementById("letter");
const pageWrap = document.getElementById("pageWrap");
const paras = [...document.querySelectorAll("#body p")];
const closing = document.getElementById("closing");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const pageNo = document.getElementById("pageNo");
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
let page = 0;
let opened = false;

/* ---------- pages: one paragraph per page ---------- */
function showPage(i, dir = 1) {
  page = Math.max(0, Math.min(i, paras.length - 1));
  const last = page === paras.length - 1;
  pageWrap.style.setProperty("--from", dir > 0 ? "24px" : "-24px");
  paras.forEach((p, k) => p.classList.toggle("current", k === page));
  closing.hidden = !last;
  daysEl.hidden = !last;
  pageWrap.scrollTop = 0;

  pageNo.textContent = `${ROMAN[page] || page + 1} / ${ROMAN[paras.length - 1] || paras.length}`;
  prevBtn.setAttribute("aria-disabled", page === 0);
  nextBtn.textContent = last ? "fold it back ↺" : "next page →";
}

prevBtn.addEventListener("click", () => { if (page > 0) showPage(page - 1, -1); });
nextBtn.addEventListener("click", () => {
  if (page < paras.length - 1) showPage(page + 1, 1);
  else foldBack();
});

// arrow keys
addEventListener("keydown", e => {
  if (!letter.classList.contains("show")) return;
  if (e.key === "ArrowRight" && page < paras.length - 1) showPage(page + 1, 1);
  if (e.key === "ArrowLeft" && page > 0) showPage(page - 1, -1);
});

// swipe left / right on phones
let touchX = null, touchY = null;
pageWrap.addEventListener("touchstart", e => {
  touchX = e.touches[0].clientX; touchY = e.touches[0].clientY;
}, { passive: true });
pageWrap.addEventListener("touchend", e => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  const dy = e.changedTouches[0].clientY - touchY;
  touchX = null;
  if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return; // ignore scrolls
  if (dx < 0 && page < paras.length - 1) showPage(page + 1, 1);
  if (dx > 0 && page > 0) showPage(page - 1, -1);
});

/* ---------- open / close ---------- */
envelope.addEventListener("click", () => {
  if (opened) return;
  opened = true;
  envelope.classList.add("open");
  burst();
  setTimeout(() => envWrap.classList.add("gone"), reduce ? 0 : 1300);
  setTimeout(() => {
    showPage(0);
    letter.classList.add("show");
  }, reduce ? 0 : 1700);
});

function foldBack() {
  letter.classList.remove("show");
  setTimeout(() => {
    envelope.classList.remove("open");
    envWrap.classList.remove("gone");
    opened = false;
  }, 700);
}

/* ---------- painted sunset + petals ---------- */
const cv = document.getElementById("sky");
const ctx = cv.getContext("2d");
let W, H, dpr, petals = [];

function size() {
  dpr = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  cv.width = W * dpr; cv.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
function petal(burstFrom) {
  const p = {
    x: burstFrom ? burstFrom.x : Math.random() * W,
    y: burstFrom ? burstFrom.y : -20 - Math.random() * H,
    r: 6 + Math.random() * 7,
    vy: 0.5 + Math.random() * 0.9,
    vx: -0.3 + Math.random() * 0.6,
    rot: Math.random() * Math.PI * 2,
    vr: (Math.random() - .5) * 0.04,
    sway: Math.random() * Math.PI * 2,
    hue: Math.random() < .5 ? "#f2a3b0" : "#e98a9a"
  };
  if (burstFrom) { p.vy = -2 - Math.random() * 3; p.vx = (Math.random() - .5) * 6; }
  return p;
}
function burst() {
  const r = envelope.getBoundingClientRect();
  for (let i = 0; i < 40; i++) petals.push(petal({ x: r.left + r.width / 2, y: r.top + r.height / 2 }));
}

function drawScene(t) {
  // sky
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#3b2346");
  g.addColorStop(.35, "#8a4a78");
  g.addColorStop(.6, "#e98a7e");
  g.addColorStop(.75, "#f7c27a");
  g.addColorStop(1, "#f7c27a");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  // sun
  const sx = W * .5, sy = H * .7;
  const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, Math.max(W, H) * .45);
  sg.addColorStop(0, "rgba(255,240,200,.95)");
  sg.addColorStop(.08, "rgba(255,214,150,.8)");
  sg.addColorStop(.3, "rgba(255,170,130,.25)");
  sg.addColorStop(1, "rgba(255,170,130,0)");
  ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);

  // a few stars up top
  ctx.fillStyle = "rgba(255,246,232,.7)";
  for (let i = 0; i < 26; i++) {
    const x = (i * 137.5) % W, y = ((i * 71) % (H * .28));
    ctx.globalAlpha = .3 + .3 * Math.sin(t / 900 + i);
    ctx.fillRect(x, y, 1.6, 1.6);
  }
  ctx.globalAlpha = 1;

  // hot-air balloon drifting
  const bx = W * .82 + Math.sin(t / 4000) * 14, by = H * .2 + Math.cos(t / 3000) * 8;
  ctx.fillStyle = "rgba(214,110,96,.85)";
  ctx.beginPath(); ctx.ellipse(bx, by, 26, 32, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(247,194,122,.8)";
  ctx.beginPath(); ctx.ellipse(bx, by, 9, 32, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(90,40,50,.6)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(bx - 14, by + 26); ctx.lineTo(bx - 6, by + 46); ctx.moveTo(bx + 14, by + 26); ctx.lineTo(bx + 6, by + 46); ctx.stroke();
  ctx.fillStyle = "rgba(90,50,40,.8)"; ctx.fillRect(bx - 7, by + 45, 14, 9);

  // hills
  ctx.fillStyle = "#b8607a";
  ctx.beginPath(); ctx.moveTo(0, H * .78);
  ctx.quadraticCurveTo(W * .3, H * .7, W * .6, H * .79);
  ctx.quadraticCurveTo(W * .85, H * .74, W, H * .77);
  ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
  ctx.fillStyle = "#6e3a5a";
  ctx.beginPath(); ctx.moveTo(0, H * .86);
  ctx.quadraticCurveTo(W * .45, H * .8, W, H * .88);
  ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();

  // two little figures on the hill, holding hands
  const fx = W * .2, fy = H * .835;
  ctx.fillStyle = "#3b2346";
  [[0, 1], [14, .9]].forEach(([dx, s]) => {
    ctx.beginPath(); ctx.arc(fx + dx, fy - 22 * s, 4.5 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(fx + dx - 3.5 * s, fy - 17 * s, 7 * s, 17 * s);
  });
  ctx.fillRect(fx + 3, fy - 11, 8, 1.6);
}

function drawPetals() {
  for (const p of petals) {
    p.sway += .02;
    p.vy = Math.min(p.vy + .04, 1.4);
    p.vx *= .985;
    p.x += p.vx + Math.sin(p.sway) * .5;
    p.y += p.vy;
    p.rot += p.vr;
    ctx.save();
    ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    ctx.fillStyle = p.hue; ctx.globalAlpha = .85;
    ctx.beginPath();
    ctx.moveTo(0, -p.r);
    ctx.quadraticCurveTo(p.r * .9, 0, 0, p.r);
    ctx.quadraticCurveTo(-p.r * .9, 0, 0, -p.r);
    ctx.fill();
    ctx.restore();
  }
  // recycle ambient petals, drop burst extras
  petals = petals.filter((p, i) => p.y < H + 30 || i < 28);
  petals.forEach((p, i) => { if (p.y > H + 30 && i < 28) Object.assign(p, petal(), { y: -20 }); });
}

function frame(t) {
  drawScene(t);
  drawPetals();
  if (!reduce) requestAnimationFrame(frame);
}

/* ---------- paper-plane intro: flies in, loops, lands on the envelope ---------- */
function intro() {
  const flight = document.getElementById("flight");
  if (reduce) { flight.remove(); envWrap.classList.remove("waiting"); return; }

  const r = envelope.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const route = document.getElementById("route");
  const trail = document.getElementById("trail");
  const plane = document.getElementById("plane");
  route.setAttribute("d",
    `M -60 ${H * .85} C ${W * .3} ${H * 1.0}, ${W * .6} ${H * .05}, ${W * .8} ${H * .25} ` +
    `S ${W * .25} ${H * .15}, ${cx} ${cy}`);

  const L = route.getTotalLength();
  const dur = 3400;
  const ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const pts = [];
  let start = null;

  function step(t) {
    if (start === null) start = t;
    const k = Math.min((t - start) / dur, 1);
    const len = ease(k) * L;
    const p = route.getPointAtLength(len);
    const a = route.getPointAtLength(Math.max(len - 1, 0));
    const b = route.getPointAtLength(Math.min(len + 1, L));
    const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
    const s = 1 - .5 * Math.max(0, (k - .75) / .25);   // shrinks as it lands
    plane.setAttribute("transform", `translate(${p.x} ${p.y}) rotate(${ang}) scale(${s})`);
    pts.push(`${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
    trail.setAttribute("d", "M" + pts.join(" L"));
    if (k < 1) requestAnimationFrame(step);
    else {
      flight.classList.add("landed");
      envWrap.classList.remove("waiting");
      burst();
      setTimeout(() => flight.remove(), 1000);
    }
  }
  setTimeout(() => requestAnimationFrame(step), 500);
}

size();
for (let i = 0; i < 28; i++) petals.push(petal());
addEventListener("resize", () => { size(); if (reduce) frame(0); });
reduce ? frame(0) : requestAnimationFrame(frame);
intro();