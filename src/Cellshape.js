import canvas from 'canvas';
const { createCanvas, Path } = canvas;

// const Oval = 'Oval';
class CellShapes {
    static getPath(propValue) {
        // console.log(propValue);
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

        let canvas = createCanvas(w, h);
        let ctx = canvas.getContext('2d');

        let commands = [];
         commands.push(`${x}, ${ym}`);
         commands.push(`${x}, ${ym - oy}, ${xm - ox}, ${y}, ${xm}, ${y}`);
         commands.push(`${xm + ox}, ${y}, ${xe}, ${ym - oy}, ${xe}, ${ym}`);
         commands.push(`${xe}, ${ym + oy}, ${xm + ox}, ${ye}, ${xm}, ${ye}`);
         commands.push(`${xm - ox}, ${ye}, ${x}, ${ym + oy}, ${x}, ${ym}`);
         commands.push('closePath');

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

        commands.push(`${x}, ${ymInner}`);
        commands.push(`${x}, ${ymInner - oy}, ${xmInner - ox}, ${y}, ${xmInner}, ${y}`);
        commands.push(`${xmInner + ox}, ${y}, ${xeInner}, ${ymInner - oy}, ${xeInner}, ${ymInner}`);
        commands.push(`${xeInner}, ${ymInner + oy}, ${xmInner + ox}, ${yeInner}, ${xmInner}, ${yeInner}`);
        commands.push(`${xmInner - ox}, ${yeInner}, ${x}, ${ymInner + oy}, ${x}, ${ymInner}`);
        commands.push('closePath');

        return commands;
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


        let commands = [];
        commands.push('beginPath');
        commands.push(`${x}, ${curveRad}`);
        commands.push(`${x}, ${y}, ${curveRad}, ${y}, ${x + curveRad}, ${y}`);
        commands.push(`${width - curveRad}, ${y}`);
        commands.push(`${width}, ${y}, ${width}, ${curveRad}, ${width}, ${curveRad}`);
        commands.push(`${width}, ${height - curveRad}`);
        commands.push(`${width}, ${height}, ${width - curveRad}, ${height}, ${width - curveRad}, ${height}`);
        commands.push(`${curveRad}, ${height}`);
        commands.push(`${x}, ${height}, ${x}, ${height - curveRad}, ${x}, ${height - curveRad}`);
        commands.push(`${x}, ${curveRad}`);
        commands.push('closePath');


        width -= gap;
        height -= gap;
        x += gap;
        y += gap;
       
        commands.push(`${x}, ${curveRad}`);
        commands.push(`${x}, ${y}, ${curveRad}, ${y}, ${x + curveRad}, ${y}`);
        commands.push(`${width - curveRad}, ${y}`);
        commands.push(`${width}, ${y}, ${width}, ${curveRad}, ${width}, ${curveRad}`);
        commands.push(`${width}, ${height - curveRad}`);
        commands.push(`${width}, ${height}, ${width - curveRad}, ${height}, ${width - curveRad}, ${height}`);
        commands.push(`${curveRad}, ${height}`);
        commands.push(`${x}, ${height}, ${x}, ${height - curveRad}, ${x}, ${height - curveRad}`);
        commands.push(`${x}, ${curveRad}`);
        commands.push('closePath');

        return commands;
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
        
        let canvas = createCanvas(width, height);
        let ctx = canvas.getContext('2d');


        let x = 0;
        let y = 0;
        let width = 120;
        let height = 80;
        let curveRad = 10;

    


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

        
        
        commands.push(`${x + 10}, ${y + 10}`);
        commands.push(`${x + width - 10}, ${y + 10}`);
        commands.push(`${x + width - 5}, ${y + 10}, ${x + width - 5}, ${y + 15}, ${x + width - 10}, ${y + 15}`);
        commands.push(`${x + width - 10}, ${y + height - 15}`);
        commands.push(`${x + width - 10}, ${y + height - 10}, ${x + width - 15}, ${y + height - 10}, ${x + width - 15}, ${y + height - 15}`);
        commands.push(`${x + 10}, ${y + height - 15}`);
        commands.push(`${x + 5}, ${y + height - 15}, ${x + 5}, ${y + height - 10}, ${x + 10}, ${y + height - 10}`);
        commands.push(`${x + 10}, ${y + 15}`);
        commands.push(`${x + 10}, ${y + 10}, ${x + 15}, ${y + 10}, ${x + 15}, ${y + 10}`);
        commands.push('closePath');
        return commands;
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
