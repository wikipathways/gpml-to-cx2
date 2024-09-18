import canvas from 'canvas';
const { createCanvas, Path } = canvas;

// const Oval = 'Oval';
class CellShapes {
    static getPath(propValue) {
        console.log(propValue);
        switch (propValue ) {
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

    static getShape(propValue) {
        switch (propValue) {
            case 'RoundedRectangle':
            case 'RoundRectangle':
            case 'Organelle':
                return this.makeRoundRect();
            case 'Oval':
            case 'Vesicle':
            case 'Ellipse':
                return this.makeEllipse();
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

        ctx.moveTo(x, ym);
        ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
        ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
        ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
        ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
        ctx.closePath();

         let commands = [];
         commands.push(` ${x} ${ym}`);
         commands.push(` ${x} ${ym - oy} ${xm - ox} ${y} ${xm} ${y}`);
         commands.push(` ${xm + ox} ${y} ${xe} ${ym - oy} ${xe} ${ym}`);
         commands.push(` ${xe} ${ym + oy} ${xm + ox} ${ye} ${xm} ${ye}`);
         commands.push(` ${xm - ox} ${ye} ${x} ${ym + oy} ${x} ${ym}`);
         commands.push('closePath');

        // return [ctx];
        return commands;
    }

    static makeNucleus() {
         
        let gap = 7.0;
        let x = 0;
        let y = 0;
        let w = 100 + gap;
        let h = 100 + gap;
        const kappa = 0.5522848;
        let ox = (w / 2) * kappa;
        let oy = (h / 2) * kappa;
        const xe = x + w;
        const ye = y + h;
        const xm = x + w / 2;
        const ym = y + h / 2;

        let canvas = createCanvas(width, height);
        let ctx = canvas.getContext('2d');

        ctx.moveTo(x, ym);
        ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
        ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
        ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
        ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
        ctx.closePath();

        x += gap / 2;
        y += gap / 2;
        w -= gap;
        h -= gap;

        ox = (w / 2) * kappa;
        oy = (h / 2) * kappa;
        const xeInner = x + w;
        const yeInner = y + h;
        const xmInner = x + w / 2;
        const ymInner = y + h / 2;

        ctx.moveTo(x, ymInner);
        ctx.bezierCurveTo(x, ymInner - oy, xmInner - ox, y, xmInner, y);
        ctx.bezierCurveTo(xmInner + ox, y, xeInner, ymInner - oy, xeInner, ymInner);
        ctx.bezierCurveTo(xeInner, ymInner + oy, xmInner + ox, yeInner, xmInner, yeInner);
        ctx.bezierCurveTo(xmInner - ox, yeInner, x, ymInner + oy, x, ymInner);
        ctx.closePath();
        return ctx;
    }

    static makeCell() {
        let gap = 1.0;
        let width = 100.0 + gap;
        let height = 80.0 + gap;
        let x = 0.0;
        let y = 0.0;
        let curveRad = 2.0;

        let canvas = createCanvas(width, height);
        let ctx = canvas.getContext('2d');

        
        ctx.beginPath();
        ctx.moveTo(x, curveRad);
        ctx.bezierCurveTo(x, y, curveRad, y, x + curveRad, y);
        ctx.lineTo(width - curveRad, y);
        ctx.bezierCurveTo(width, y, width, curveRad, width, curveRad);
        ctx.lineTo(width, height - curveRad);
        ctx.bezierCurveTo(width, height, width - curveRad, height, width - curveRad, height);
        ctx.lineTo(curveRad, height);
        ctx.bezierCurveTo(x, height, x, height - curveRad, x, height - curveRad);
        ctx.lineTo(x, curveRad);
        ctx.closePath();

        width -= gap;
        height -= gap;
        x += gap;
        y += gap;
        ctx.moveTo(x, curveRad);
        ctx.bezierCurveTo(x, y, curveRad, y, x + curveRad, y);
        ctx.lineTo(width - curveRad, y);
        ctx.bezierCurveTo(width, y, width, curveRad, width, curveRad);
        ctx.lineTo(width, height - curveRad);
        ctx.bezierCurveTo(width, height, width - curveRad, height, width - curveRad, height);
        ctx.lineTo(curveRad, height);
        ctx.bezierCurveTo(x, height, x, height - curveRad, x, height - curveRad);
        ctx.lineTo(x, curveRad);
        ctx.closePath();
        return ctx;
    }

    static makeRoundRect() {
        const width = 100.0;
        const height = 80.0;
        const x = 0.0;
        const y = 0.0;
        const curveRad = 8.0;


        let canvas = createCanvas(width, height);
        let ctx = canvas.getContext('2d')

        
        ctx.moveTo(x, curveRad);
        ctx.bezierCurveTo(x, y, curveRad, y, x + curveRad, y);
        ctx.lineTo(width - curveRad, y);
        ctx.bezierCurveTo(width, y, width, curveRad, width, curveRad);
        ctx.lineTo(width, height - curveRad);
        ctx.bezierCurveTo(width, height, width - curveRad, height, width - curveRad, height);
        ctx.lineTo(curveRad, height);
        ctx.bezierCurveTo(x, height, x, height - curveRad, x, height - curveRad);
        ctx.lineTo(x, curveRad);
        ctx.closePath();

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
        const arc = new Path2D();
        arc.arc(50, 50, 50, -degrees * (Math.PI / 180), -180 * (Math.PI / 180), false);
        return arc;
    }

    static makeER() {
        
        let x = 0;
        let y = 0;
        let width = 120;
        let height = 80;
        let curveRad = 15;

        let canvas = createCanvas(width, height);
        let ctx = canvas.getContext('2d')

        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x, y + height);
        ctx.closePath();

        
        ctx.moveTo(x + curveRad, y + curveRad);
        ctx.lineTo(x + width - curveRad, y + curveRad);
        ctx.bezierCurveTo(x + width, y + curveRad, x + width, y + curveRad + 10, x + width - curveRad, y + curveRad + 10);
        ctx.lineTo(x + curveRad, y + curveRad + 10);
        ctx.bezierCurveTo(x, y + curveRad + 10, x, y + curveRad, x + curveRad, y + curveRad);
        ctx.closePath();

        
        return ctx;
    }

    static makeSR() {
        let canvas = createCanvas(width, height);
        let ctx = canvas.getContext('2d')
        
        let x = 0;
        let y = 0;
        let width = 100;
        let height = 100;
        let curveRad = 20;

        ctx.moveTo(x + curveRad, y);
        ctx.lineTo(x + width - curveRad, y);
        ctx.bezierCurveTo(x + width, y, x + width, y + curveRad, x + width, y + curveRad);
        ctx.lineTo(x + width, y + height - curveRad);
        ctx.bezierCurveTo(x + width, y + height, x + width - curveRad, y + height, x + width - curveRad, y + height);
        ctx.lineTo(x + curveRad, y + height);
        ctx.bezierCurveTo(x, y + height, x, y + height - curveRad, x, y + height - curveRad);
        ctx.lineTo(x, y + curveRad);
        ctx.bezierCurveTo(x, y, x + curveRad, y, x + curveRad, y);
        ctx.closePath();
        return ctx;
    }

    static makeGolgi() {
        let canvas = createCanvas(width, height);
        let ctx = canvas.getContext('2d')

        let x = 0;
        let y = 0;
        let width = 100;
        let height = 80;
        let curveRad = 12;

        ctx.moveTo(x + curveRad, y);
        ctx.lineTo(x + width - curveRad, y);
        ctx.bezierCurveTo(x + width, y, x + width, y + curveRad, x + width, y + curveRad);
        ctx.lineTo(x + width, y + height - curveRad);
        ctx.bezierCurveTo(x + width, y + height, x + width - curveRad, y + height, x + width - curveRad, y + height);
        ctx.lineTo(x + curveRad, y + height);
        ctx.bezierCurveTo(x, y + height, x, y + height - curveRad, x, y + height - curveRad);
        ctx.lineTo(x, y + curveRad);
        ctx.bezierCurveTo(x, y, x + curveRad, y, x + curveRad, y);
        ctx.closePath();

        
        ctx.moveTo(x + 20, y + 20);
        ctx.lineTo(x + width - 20, y + 20);
        ctx.bezierCurveTo(x + width - 10, y + 20, x + width - 10, y + 30, x + width - 20, y + 30);
        ctx.lineTo(x + width - 20, y + height - 30);
        ctx.bezierCurveTo(x + width - 20, y + height - 20, x + width - 30, y + height - 20, x + width - 30, y + height - 30);
        ctx.lineTo(x + 20, y + height - 30);
        ctx.bezierCurveTo(x + 10, y + height - 30, x + 10, y + height - 20, x + 20, y + height - 20);
        ctx.lineTo(x + 20, y + 30);
        ctx.bezierCurveTo(x + 20, y + 20, x + 30, y + 20, x + 30, y + 20);
        ctx.closePath();

        
        return ctx;
    }

    static makeBrace() {
        
        let canvas = createCanvas(width, height);
        let ctx = canvas.getContext('2d');


        let x = 0;
        let y = 0;
        let width = 120;
        let height = 80;
        let curveRad = 10;

        ctx.moveTo(x + curveRad, y);
        ctx.lineTo(x + width - curveRad, y);
        ctx.bezierCurveTo(x + width, y, x + width, y + curveRad, x + width, y + curveRad);
        ctx.lineTo(x + width, y + height - curveRad);
        ctx.bezierCurveTo(x + width, y + height, x + width - curveRad, y + height, x + width - curveRad, y + height);
        ctx.lineTo(x + curveRad, y + height);
        ctx.bezierCurveTo(x, y + height, x, y + height - curveRad, x, y + height - curveRad);
        ctx.lineTo(x, y + curveRad);
        ctx.bezierCurveTo(x, y, x + curveRad, y, x + curveRad, y);
        ctx.closePath();

        
        ctx.moveTo(x + 10, y + 10);
        ctx.lineTo(x + width - 10, y + 10);
        ctx.bezierCurveTo(x + width - 5, y + 10, x + width - 5, y + 15, x + width - 10, y + 15);
        ctx.lineTo(x + width - 10, y + height - 15);
        ctx.bezierCurveTo(x + width - 10, y + height - 10, x + width - 15, y + height - 10, x + width - 15, y + height - 15);
        ctx.lineTo(x + 10, y + height - 15);
        ctx.bezierCurveTo(x + 5, y + height - 15, x + 5, y + height - 10, x + 10, y + height - 10);
        ctx.lineTo(x + 10, y + 15);
        ctx.bezierCurveTo(x + 10, y + 10, x + 15, y + 10, x + 15, y + 10);
        ctx.closePath();

        
        return ctx;
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
