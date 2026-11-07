// Arena e carri vettoriali disegnati alla risoluzione del canvas.
const TankArena = (() => {
  const width = 820, height = 370;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const sand = "#d3b891";

  function shape(ctx, color, ...points) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(...points[0]);
    points.slice(1).forEach((p) => ctx.lineTo(...p));
    ctx.closePath();
    ctx.fill();
  }
  function rect(ctx, color, x, y, w, h, r = 0) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
  }
  function ring(ctx, x, y, r, color, line = 2) {
    ctx.strokeStyle = color;
    ctx.lineWidth = line;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  function disk(ctx, x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function terrain(ctx) {
    const ground = ctx.createLinearGradient(0, 0, 0, height);
    ground.addColorStop(0, "#ad916d");
    ground.addColorStop(0.53, "#e2cdab");
    ground.addColorStop(1, "#c8aa80");
    rect(ctx, ground, 0, 0, width, height);
    for (let y = 2, row = 0; y < height; y += 30, row++) {
      for (let x = row % 2 ? -30 : 0, col = 0; x < width; x += 59, col++) {
        const shade = (row * 71 + col * 37) % 7;
        rect(ctx, `rgba(97,66,48,${0.05 + shade * 0.017})`, x, y, 57, 28, 2);
        if (shade === 2) shape(ctx, "#ae9476", [x + 14, y + 1], [x + 19, y + 13], [x + 32, y + 17], [x + 17, y + 15]);
      }
    }

    // Mosaico centrale e fascia a meandro.
    disk(ctx, 410, 205, 87, "#c5a982");
    ring(ctx, 410, 205, 82, "#b38b64", 5);
    ring(ctx, 410, 205, 72, "#e2c8a1", 3);
    ctx.save();
    ctx.translate(410, 205);
    for (let i = 0; i < 12; i++) {
      shape(ctx, i % 2 ? "#ab825c" : "#edd5ad", [0, -54], [7, -29], [0, -17], [-7, -29]);
      ctx.rotate(Math.PI / 6);
    }
    disk(ctx, 0, 0, 13, "#926b50");
    disk(ctx, 0, 0, 8, "#ebc89a");
    ctx.restore();
    rect(ctx, "#94734e", 0, 344, width, 26);
    rect(ctx, "#deb482", 0, 345, width, 2);
    ctx.strokeStyle = "#dfbf88";
    ctx.lineWidth = 2;
    for (let x = 0; x < width; x += 28) {
      ctx.beginPath();
      ctx.moveTo(x, 360);
      ctx.lineTo(x + 5, 360);
      ctx.lineTo(x + 5, 350);
      ctx.lineTo(x + 25, 350);
      ctx.lineTo(x + 25, 360);
      ctx.lineTo(x + 12, 360);
      ctx.lineTo(x + 12, 355);
      ctx.lineTo(x + 20, 355);
      ctx.stroke();
    }

    // Tempio dorico sul lato nord.
    rect(ctx, "#60473845", 279, 36, 275, 74, 5);
    rect(ctx, "#a88b69", 276, 31, 268, 61, 2);
    rect(ctx, "#ead6b1", 286, 32, 246, 52);
    rect(ctx, "#524139", 311, 38, 198, 34);
    for (let x = 303; x < 530; x += 35) {
      rect(ctx, "#846a57", x + 4, 35, 14, 46, 2);
      rect(ctx, "#d7bd97", x, 33, 13, 44, 2);
      rect(ctx, "#f4e0b7", x + 2, 34, 3, 42);
      rect(ctx, "#f0d7ad", x - 3, 72, 19, 6);
    }
    shape(ctx, "#f3d4a4", [279, 35], [409, -9], [539, 35]);
    shape(ctx, "#a87e57", [301, 30], [409, -4], [518, 30]);
    shape(ctx, "#dabc91", [320, 27], [409, 0], [499, 27]);
    rect(ctx, "#76573d", 278, 34, 264, 4);

    for (const [x, y] of [[51, 66], [113, 114], [756, 66], [706, 124], [64, 272], [758, 285]]) {
      rect(ctx, "#795b4780", x + 3, y + 6, 43, 25, 3);
      rect(ctx, "#ab8b69", x, y, 37, 23, 3);
      rect(ctx, "#e3cba5", x + 1, y, 34, 15, 3);
      shape(ctx, "#806852", [x + 15, y], [x + 20, y + 9], [x + 17, y + 20], [x + 16, y + 9]);
      disk(ctx, x + 10, y + 6, 6, "#c1a787");
      ring(ctx, x + 10, y + 6, 5, "#f0d7ad", 1.5);
      for (let i = 0; i < 5; i++) disk(ctx, x - 12 + i * 8, y + 31 + i % 3 * 4, 1 + i % 3, "#8c8057");
    }
    const vignette = ctx.createRadialGradient(410, 182, 127, 410, 182, 465);
    vignette.addColorStop(0, "#35251b00");
    vignette.addColorStop(1, "#35251b66");
    rect(ctx, vignette, 0, 0, width, height);
  }

  function tank(ctx, spec, x, y, angle, { scale = 1, wreck = false, moving = 0 } = {}) {
    const hull = wreck ? "#4d453d" : spec.color, trim = wreck ? "#89735e" : spec.trim;
    const size = [0, 0.92, 1, 1.08, 1.12][spec.level];
    const tread = spec.level === 1 ? 13 : 15;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(scale * size, scale * size);
    rect(ctx, "#33251e66", -39, -23, 77, 55, 10);
    for (const side of [-1, 1]) {
      const trackY = side === -1 ? -25 : 25 - tread;
      rect(ctx, "#252624", -37, trackY, 72, tread, 5);
      for (let lug = -33 + moving % 7; lug < 31; lug += 7) rect(ctx, "#55534a", lug, trackY + 2, 2, tread - 4);
      rect(ctx, trim, -31, side * 15 - 2, 58, 4, 2);
    }
    const nose = spec.level === 1 ? 26 : 32;
    shape(ctx, "#3c3730", [-35, -16], [-27, -22], [nose - 7, -21], [nose + 3, -13], [nose + 3, 13], [nose - 7, 21], [-27, 22], [-35, 16]);
    shape(ctx, hull, [-32, -14], [-24, -18], [nose - 8, -17], [nose, -10], [nose, 10], [nose - 8, 17], [-24, 18], [-32, 14]);
    rect(ctx, trim, -30, -11, 11, 22, 2);
    for (let i = -8; i <= 8; i += 4) rect(ctx, "#373630", -28, i, 7, 2);
    rect(ctx, "#312b24", 5, spec.level >= 3 ? -5 : -4, wreck ? 25 : 47, spec.level >= 3 ? 10 : 8, 2);
    rect(ctx, trim, 13, -2, wreck ? 14 : 38, 4, 1);
    if (!wreck) rect(ctx, hull, 46, -6, 8, 12, 2);
    if (spec.level === 3) {
      rect(ctx, trim, 19, -11, 26, 3, 1);
      rect(ctx, trim, 19, 8, 26, 3, 1);
    }
    if (spec.level === 2) {
      rect(ctx, trim, 15, -16, 13, 5, 1);
      rect(ctx, trim, 15, 11, 13, 5, 1);
    }
    ring(ctx, -4, 0, 15, trim, 3);
    disk(ctx, -4, 0, 13, hull);
    if (spec.level === 1) {
      shape(ctx, trim, [-14, -9], [7, -4], [0, 0], [7, 4], [-14, 9], [-8, 0]);
    } else if (spec.level === 2) {
      shape(ctx, trim, [-14, -7], [4, -7], [6, 0], [-4, 10], [-14, 0]);
      shape(ctx, hull, [-9, -4], [1, -4], [-4, 5]);
    } else if (spec.level === 3) {
      rect(ctx, trim, -13, -1, 18, 2);
      rect(ctx, trim, -1, -8, 2, 16);
      for (const offset of [-8, 0, 7]) rect(ctx, trim, 0, offset, 7, 2);
    } else {
      shape(ctx, "#fff2b7", [-6, -11], [3, -11], [-2, -2], [6, -2], [-7, 11], [-4, 2], [-12, 2]);
      for (const side of [-1, 1]) {
        shape(ctx, trim, [-27, 15 * side], [-11, 11 * side], [3, 18 * side], [-23, 20 * side]);
      }
    }
    if (wreck) {
      shape(ctx, "#282729", [-14, -12], [5, -10], [3, 8], [-17, 12]);
      disk(ctx, -6, 0, 4, "#da7339");
    }
    ctx.restore();
  }

  function setup(canvas, w, h) {
    const ctx = canvas.getContext("2d");
    const scale = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = w * scale;
    canvas.height = h * scale;
    ctx.scale(scale, scale);
    return ctx;
  }

  let backdrop;
  function scene(canvas, compact = false) {
    const ctx = setup(canvas, width, height);
    if (!backdrop) {
      backdrop = document.createElement("canvas");
      terrain(setup(backdrop, width, height));
    }
    return (match, visualTime = match.now, wreck = null) => {
      ctx.drawImage(backdrop, 0, 0, width, height);
      const motion = reduced.matches ? 0 : visualTime;
      const positions = [match.player, match.bot].map((unit, i) => TankRules.position(unit, Boolean(i), match.now));
      const where = (unit) => positions[unit === match.player ? 0 : 1];
      const aim = (from, to) => Math.atan2(to.y - from.y, to.x - from.x);
      [match.player, match.bot].forEach((unit, i) => {
        const p = positions[i], lost = unit === wreck || unit.hp === 0;
        ring(ctx, p.x, p.y, 49, i ? "#8b3a31" : "#365c5e", 3);
        if (unit.shield > match.now) {
          disk(ctx, p.x, p.y, 54, "#8bd3ff38");
          ring(ctx, p.x, p.y, 54, "#d8f8ff", 4);
        }
        if (unit.rage > match.now) ring(ctx, p.x, p.y, 56, "#ffcc55", 3);
        tank(ctx, unit.tank, p.x, p.y, aim(p, positions[1 - i]), { wreck: lost, moving: motion / 35 });
        if (lost && !reduced.matches) {
          for (let j = 0; j < 4; j++) {
            const drift = ((visualTime / 17 + j * 12) % 52 + 52) % 52;
            disk(ctx, p.x + j * 5 - drift / 4, p.y - drift, 5 + drift / 6, "#3c373747");
          }
        }
        if (!compact) {
          ctx.font = "700 15px system-ui";
          ctx.textAlign = "center";
          rect(ctx, "#272621", p.x - 30, p.y + 57, 60, 23, 7);
          ctx.fillStyle = sand;
          ctx.fillText(i ? "BOT" : "TU", p.x, p.y + 74);
        }
      });
      match.shots.forEach((shot) => {
        if (visualTime < shot.start || visualTime >= shot.end) return;
        const from = where(shot.unit), to = shot.aim || where(shot.target);
        const t = (visualTime - shot.start) / (shot.end - shot.start);
        const a = aim(from, to), start = 48;
        const x = from.x + Math.cos(a) * start * (1 - t) + (to.x - from.x) * t;
        const y = from.y + Math.sin(a) * start * (1 - t) + (to.y - from.y) * t;
        const color = shot.kind === "wave" ? "#b9f5ff" : shot.kind === "bolt" ? "#fff8a3" : "#ffda7b";
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(a);
        if (shot.kind === "bolt") {
          shape(ctx, color, [-70, 7], [-45, -6], [-34, 4], [-14, -11], [-4, 0], [8, -4], [-9, 8], [-15, -3], [-38, 11], [-48, 0]);
        } else {
          shape(ctx, color, [-32, 0], [-3, -5], [6, 0], [-3, 5]);
          disk(ctx, 0, 0, shot.kind === "heavy" ? 9 : 5, color);
          if (shot.kind === "wave") ring(ctx, 0, 0, 13 + 11 * t, color, 3);
        }
        ctx.restore();
      });
      match.effects.forEach(({ unit, kind, start, splash, damage, shield, aim }) => {
        const age = visualTime - start;
        if (age < 0 || age > 900) return;
        const { x, y } = aim || where(unit);
        const t = age / 900;
        const color = shield || kind === "wave" ? "#bcf7ff" : kind === "bolt" ? "#fff694" : "#f98b40";
        ctx.save();
        ctx.globalAlpha = 1 - t;
        ring(ctx, x, y, 16 + t * (splash || 20), color, 4);
        if (!reduced.matches) {
          for (let i = 0; i < 12; i++) {
            const a = i * Math.PI / 6 + start % 3, distance = t * (35 + (i % 3) * 15);
            disk(ctx, x + Math.cos(a) * distance, y + Math.sin(a) * distance, 4 - t * 2, i % 2 ? color : "#fff1b3");
          }
        }
        if (damage) {
          ctx.font = "800 24px system-ui";
          ctx.textAlign = "center";
          ctx.strokeStyle = "#442824";
          ctx.lineWidth = 4;
          ctx.strokeText("−" + damage, x, y - 30 - t * 35);
          ctx.fillStyle = "#fff5d4";
          ctx.fillText("−" + damage, x, y - 30 - t * 35);
        }
        ctx.restore();
      });
    };
  }

  function portrait(canvas, spec) {
    const ctx = setup(canvas, 150, 92);
    tank(ctx, spec, 74, 44, -0.24, { scale: 1.12 });
  }

  return { scene, portrait, reduced };
})();
