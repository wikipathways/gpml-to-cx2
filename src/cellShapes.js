
import canvas from 'canvas';
const { createCanvas, Path } = canvas;

// const Oval = 'Oval';
class CellShapes {
  static getPath(propValue) {
    // console.log(propValue);
    switch (propValue) {
      case 'Mitochondria':
        return this.makeMitochondria();
      case 'Endoplasmic Reticulum':
        return this.makeER();
      case 'Sarcoplasmic Reticulum':
        return this.makeSR();
      case 'Golgi Apparatus':
        return this.makeGolgi();
      case 'Brace':
        return this.makeBrace();
      case 'Triangle':
        return this.makeTriangle();
      case 'Cell':
        return this.makeCell();
      case 'Nucleus':
        return this.makeNucleus();
      default:
        return null;
    }
  }

  static getShape(propValue, startRotation = 0) {
    switch (propValue) {
      case 'RoundedRectangle':
      case 'RoundRectangle':
      case 'Organelle':
        return this.makeRoundRect();
      case 'Oval':
      case 'Vesicle':
      case 'Ellipse':
        return this.makeEllipse();
      case 'Arc':
        return this.makeArc(startRotation);
      default:
        return null;
    }
  }

  static makeEllipse() {
    let x = 0;
    let y = 0;
    let w = 100;
    let h = 100;
    const kappa = 0.5522848;
    let ox = (w / 2) * kappa;
    let oy = (h / 2) * kappa;
    let xe = x + w;
    let ye = y + h;
    let xm = x + w / 2;
    let ym = y + h / 2;

    let canvas = createCanvas(w, h);
    let ctx = canvas.getContext('2d');

    let commands = [];
    commands.push(` ${ym}`);
    commands.push(`C ${x} ${ym - oy} ${xm - ox} ${y} ${xm} ${y}`);
    commands.push(`C ${xm + ox} ${y} ${xe} ${ym - oy} ${xe} ${ym}`);
    commands.push(`C ${xe} ${ym + oy} ${xm + ox} ${ye} ${xm} ${ye}`);
    commands.push(`C ${xm - ox} ${ye} ${x} ${ym + oy} ${x} ${ym}`);
    commands.push('Z');

    // return [ctx];
    return commands.join(' ');
    // return commands;
  }

  static makeNucleus() {
    let outerRadius = 53.5; // Half of the outer circle's width/height
    let innerRadius = 50; // Example value for inner circle's radius (you can adjust this)

    // Outer circle points and cubic Bezier curve control points
    let x = 0.0;
    let y = outerRadius;
    let w = 107.0; // Width for outer circle
    let h = 107.0; // Height for outer circle
    const kappa = 0.5522848; // Approximation for cubic bezier curve control points for a circle

    // Outer circle control points
    let commands = [];
    commands.push(`${x} ${y}`);
    commands.push(`C ${x} ${y - (outerRadius * kappa)} ${outerRadius * kappa} 0.0 ${outerRadius} 0.0`);
    commands.push(`C ${outerRadius + (outerRadius * kappa)} 0.0 ${w} ${y - (outerRadius * kappa)} ${w} ${y}`);
    commands.push(`C ${w} ${y + (outerRadius * kappa)} ${outerRadius + (outerRadius * kappa)} ${h} ${outerRadius} ${h}`);
    commands.push(`C ${(outerRadius * kappa)} ${h} ${x} ${y + (outerRadius * kappa)} ${x} ${y}`);
    commands.push('Z'); // Close the path for the outer circle

    // Inner circle
    x = 3.5;
    y = outerRadius;
    w = 103.5;
    h = 103.5;

    // Inner circle control points
    commands.push(`M ${x} ${y}`);
    commands.push(`C ${x} ${y - (innerRadius * kappa)} ${(innerRadius * kappa)} 3.5 ${innerRadius} 3.5`);
    commands.push(`C ${innerRadius + (innerRadius * kappa)} 3.5 ${w} ${y - (innerRadius * kappa)} ${w} ${y}`);
    commands.push(`C ${w} ${y + (innerRadius * kappa)} ${innerRadius + (innerRadius * kappa)} ${h} ${innerRadius} ${h}`);
    commands.push(`C ${(innerRadius * kappa)} ${h} ${x} ${y + (innerRadius * kappa)} ${x} ${y}`);
    commands.push('Z'); // Close the path for the inner circle

    return commands.join(' ');
  }

  static makeCell() {
    let gap = 1.0;
    let width = 100.0 + gap;
    let height = 80.0 + gap;
    let x = 0.0;
    let y = 0.0;
    let curveRad = 2.0;

    // First path (outer shape)
    let commands = [];
    commands.push(`${x.toFixed(1)} ${curveRad.toFixed(1)}`);
    commands.push(`C ${x.toFixed(1)} ${y.toFixed(1)} ${curveRad.toFixed(1)} ${y.toFixed(1)} ${curveRad.toFixed(1)} ${y.toFixed(1)}`);
    commands.push(`L ${(width - curveRad - gap).toFixed(1)} ${y.toFixed(1)}`);
    commands.push(`C ${(width + gap).toFixed(1)} ${y.toFixed(1)} ${(width + gap).toFixed(1)} ${curveRad.toFixed(1)} ${(width + gap).toFixed(1)} ${curveRad.toFixed(1)}`);
    commands.push(`L ${(width + gap).toFixed(1)} ${(height - curveRad - gap).toFixed(1)}`);
    commands.push(`C ${(width + gap).toFixed(1)} ${(height + gap).toFixed(1)} ${(width - curveRad - gap).toFixed(1)} ${(height + gap).toFixed(1)} ${(width - curveRad - gap).toFixed(1)} ${(height + gap).toFixed(1)}`);
    commands.push(`L ${curveRad.toFixed(1)} ${(height + gap).toFixed(1)}`);
    commands.push(`C ${x.toFixed(1)} ${(height + gap).toFixed(1)} ${x.toFixed(1)} ${(height - curveRad - gap).toFixed(1)} ${x.toFixed(1)} ${(height - curveRad - gap).toFixed(1)}`);
    commands.push(`L ${x.toFixed(1)} ${curveRad.toFixed(1)} Z`);

    // Second path (inner shape with gap)
    let innerWidth = width - gap;
    let innerHeight = height - gap;
    let innerX = x + gap;
    let innerY = y + gap;

    commands.push(`M ${innerX.toFixed(1)} ${curveRad.toFixed(1)}`);
    commands.push(`C ${innerX.toFixed(1)} ${innerY.toFixed(1)} ${(innerX + curveRad).toFixed(1)} ${innerY.toFixed(1)} ${(innerX + curveRad).toFixed(1)} ${innerY.toFixed(1)}`);
    commands.push(`L ${(innerWidth - curveRad).toFixed(1)} ${innerY.toFixed(1)}`);
    commands.push(`C ${innerWidth.toFixed(1)} ${innerY.toFixed(1)} ${innerWidth.toFixed(1)} ${curveRad.toFixed(1)} ${innerWidth.toFixed(1)} ${curveRad.toFixed(1)}`);
    commands.push(`L ${innerWidth.toFixed(1)} ${(innerHeight - curveRad).toFixed(1)}`);
    commands.push(`C ${innerWidth.toFixed(1)} ${innerHeight.toFixed(1)} ${(innerWidth - curveRad).toFixed(1)} ${innerHeight.toFixed(1)} ${(innerWidth - curveRad).toFixed(1)} ${innerHeight.toFixed(1)}`);
    commands.push(`L ${(curveRad + gap).toFixed(1)} ${innerHeight.toFixed(1)}`);
    commands.push(`C ${innerX.toFixed(1)} ${innerHeight.toFixed(1)} ${innerX.toFixed(1)} ${(innerHeight - curveRad).toFixed(1)} ${innerX.toFixed(1)} ${(innerHeight - curveRad).toFixed(1)}`);
    commands.push(`L ${innerX.toFixed(1)} ${curveRad.toFixed(1)} Z`);

    return commands.join(' ');
  }
  static makeRoundRect() {
    const width = 100.0;
    const height = 80.0;
    const x = 0.0;
    const y = 0.0;
    const curveRad = 8.0;

    let canvas = createCanvas(width, height);
    let ctx = canvas.getContext('2d')

    let commands = [];

    commands.push(`M ${x} ${curveRad}`);
    commands.push(`C ${x} ${y} ${curveRad} ${y} ${x + curveRad} ${y}`);
    commands.push(`L ${width - curveRad} ${y}`);
    commands.push(`C ${width} ${y} ${width} ${curveRad} ${width} ${curveRad}`);
    commands.push(`L ${width} ${height - curveRad}`);
    commands.push(`C ${width} ${height} ${width - curveRad} ${height} ${width - curveRad} ${height}`);
    commands.push(`L ${curveRad} ${height}`);
    commands.push(`C ${x} ${height} ${x} ${height - curveRad} ${x} ${height - curveRad}`);
    commands.push(`L ${x} ${curveRad}`);
    commands.push('Z');

    return commands;
  }

  static makeArc(startRotation) {
    const degrees = startRotation * 180 / Math.PI;
    let commands = [];
    let x = 0;
    let y = 0;
    let width = 100;
    let height = 10;
    let startAngle = -degrees;
    let arcExtent = -180;

    commands.push(`x=${x}`);
    commands.push(`y=${y}`);
    commands.push(`width=${width}`);
    commands.push(`height=${height}`);
    commands.push(`startAngle=${-(startRotation * 180 / Math.PI)}`);
    commands.push(`arcExtent=${arcExtent}`);
    console.log(commands);

    return commands;
  }

  static makeMitochondria() {
    const pathCommands = [];

    // First part of the mitochondrion path
    pathCommands.push("M 72.81 85.70");
    pathCommands.push("C 97.59 83.01 94.55 147.38 119.28 144.29");
    pathCommands.push("C 166.27 144.40 136.22 42.38 175.51 41.70");
    pathCommands.push("C 215.08 41.02 188.27 150.12 227.79 148.28");
    pathCommands.push("C 271.14 146.25 230.67 29.04 274.00 26.55");
    pathCommands.push("C 317.72 24.05 290.58 142.55 334.36 143.22");
    pathCommands.push("C 371.55 143.80 351.55 43.14 388.66 45.75");
    pathCommands.push("C 429.51 48.62 392.43 153.80 432.85 160.40");
    pathCommands.push("C 459.82 164.80 457.96 94.30 485.13 97.26");
    pathCommands.push("C 548.33 124.69 534.13 233.75 472.75 258.89");
    pathCommands.push("C 454.92 261.42 450.22 220.87 432.35 223.03");
    pathCommands.push("C 400.60 226.86 409.73 303.71 377.80 301.95");
    pathCommands.push("C 348.05 300.30 365.16 223.61 335.37 223.28");
    pathCommands.push("C 295.83 222.85 316.30 327.99 276.78 326.44");
    pathCommands.push("C 241.90 325.08 266.95 236.11 232.34 231.61");
    pathCommands.push("C 200.07 227.42 201.79 311.88 169.71 306.49");
    pathCommands.push("C 134.22 300.53 167.04 209.92 131.32 205.60");
    pathCommands.push("C 110.14 203.04 116.28 257.74 94.95 258.26");
    pathCommands.push("C 15.35 236.77 5.51 114.51 72.81 85.70");
    pathCommands.push("Z"); // Close the path

    // Second part of the mitochondrion path
    pathCommands.push("M 272.82 0.84");
    pathCommands.push("C 378.97 1.13 542.51 62.39 543.54 168.53");
    pathCommands.push("C 544.58 275.18 381.50 342.19 274.84 342.28");
    pathCommands.push("C 166.69 342.36 0.84 274.66 2.10 166.51");
    pathCommands.push("C 3.33 60.72 167.03 0.56 272.82 0.84");
    pathCommands.push("Z"); // Close the path

    return pathCommands.join(' '); // Returns a string representing the path commands
  }

  static makeER() {
    let x = 0;
    let y = 0;
    let width = 120;
    let height = 80;
    let curveRad = 15;

    let canvas = createCanvas(width, height);
    let ctx = canvas.getContext('2d')

    let commands = [];
    commands.push(`${x}, ${y}`);
    commands.push(`${x + width}, ${y}`);
    commands.push(`${x + width}, ${y + height}`);
    commands.push(`${x}, ${y + height}`);
    commands.push('closePath');

    commands.push(`${x + curveRad}, ${y + curveRad}`);
    commands.push(`${x + width - curveRad}, ${y + curveRad}`);
    commands.push(`${x + width}, ${y + curveRad}, ${x + width}, ${y + curveRad + 10}, ${x + width - curveRad}, ${y + curveRad + 10}`);
    commands.push(`${x + curveRad}, ${y + curveRad + 10}`);
    commands.push(`${x}, ${y + curveRad + 10}, ${x}, ${y + curveRad}, ${x + curveRad}, ${y + curveRad}`);
    commands.push('closePath');
    return commands;
  }

  static makeSR() {
    let canvas = createCanvas(width, height);
    let ctx = canvas.getContext('2d')

    let x = 0;
    let y = 0;
    let width = 100;
    let height = 100;
    let curveRad = 20;

    let commands = [];
    commands.push(`${x + curveRad}, ${y}`);
    commands.push(`${x + width - curveRad}, ${y}`);
    commands.push(`${x + width}, ${y}, ${x + width}, ${y + curveRad}, ${x + width}, ${y + curveRad}`);
    commands.push(`${x + width}, ${y + height - curveRad}`);
    commands.push(`${x + width}, ${y + height}, ${x + width - curveRad}, ${y + height}, ${x + width - curveRad}, ${y + height}`);
    commands.push(`${x + curveRad}, ${y + height}`);
    commands.push(`${x}, ${y + height}, ${x}, ${y + height - curveRad}, ${x}, ${y + height - curveRad}`);
    commands.push(`${x}, ${y + curveRad}`);
    commands.push(`${x}, ${y}, ${x + curveRad}, ${y}, ${x + curveRad}, ${y}`);
    commands.push('closePath');

    return commands;
  }

  static makeGolgi() {
    let canvas = createCanvas(width, height);
    let ctx = canvas.getContext('2d')

    let x = 0;
    let y = 0;
    let width = 100;
    let height = 80;
    let curveRad = 12;

    let commands = [];
    commands.push(`${x + curveRad}, ${y}`);
    commands.push(`${x + width - curveRad}, ${y}`);
    commands.push(`${x + width}, ${y}, ${x + width}, ${y + curveRad}, ${x + width}, ${y + curveRad}`);
    commands.push(`${x + width}, ${y + height - curveRad}`);
    commands.push(`${x + width}, ${y + height}, ${x + width - curveRad}, ${y + height}, ${x + width - curveRad}, ${y + height}`);
    commands.push(`${x + curveRad}, ${y + height}`);
    commands.push(`${x}, ${y + height}, ${x}, ${y + height - curveRad}, ${x}, ${y + height - curveRad}`);
    commands.push(`${x}, ${y + curveRad}`);
    commands.push(`${x}, ${y}, ${x + curveRad}, ${y}, ${x + curveRad}, ${y}`);
    commands.push('closePath');
    commands.push(`${x + 20}, ${y + 20}`);
    commands.push(`${x + width - 20}, ${y + 20}`);
    commands.push(`${x + width - 10}, ${y + 20}, ${x + width - 10}, ${y + 30}, ${x + width - 20}, ${y + 30}`);
    commands.push(`${x + width - 20}, ${y + height - 30}`);
    commands.push(`${x + width - 20}, ${y + height - 20}, ${x + width - 30}, ${y + height - 20}, ${x + width - 30}, ${y + height - 30}`);
    commands.push(`${x + 20}, ${y + height - 30}`);
    commands.push(`${x + 10}, ${y + height - 30}, ${x + 10}, ${y + height - 20}, ${x + 20}, ${y + height - 20}`);
    commands.push(`${x + 20}, ${y + 30}`);
    commands.push(`${x + 20}, ${y + 20}, ${x + 30}, ${y + 20}, ${x + 30}, ${y + 20}`);
    commands.push('closePath');

    return commands;
  }

  static makeBrace() {
    let commands = [];

    // Move to the starting point (8, 8)
    commands.push(`M 8.0 8.0`);

    // Draw the first quadratic curve from (8, 8) to (6, 5) with control point (6, 8)
    commands.push(`Q 6.0 8.0 6.0 5.0`);

    // Draw the second quadratic curve from (6, 5) to (4, 2) with control point (6, 2)
    commands.push(`Q 6.0 2.0 4.0 2.0`);

    // Draw the third quadratic curve from (4, 2) to (6, -1) with control point (6, 2)
    commands.push(`Q 6.0 2.0 6.0 -1.0`);

    // Draw the fourth quadratic curve from (6, -1) to (8, -4) with control point (6, -4)
    commands.push(`Q 6.0 -4.0 8.0 -4.0`);

    // Close the path
    commands.push(`Z`);

    // Return the path as a string
    return commands.join(' ');
  }

  static makeTriangle() {
    let canvas = createCanvas(width, height);
    let ctx = canvas.getContext('2d')
    ctx.moveTo(50, 0);
    ctx.lineTo(100, 100);
    ctx.lineTo(0, 100);
    ctx.closePath();
    return ctx;
  }
}
export default CellShapes;