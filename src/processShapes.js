import { getBorderThickness, constructLabelFont } from "./auxiliary.js";
import CellShapes from "./Cellshape.js";
import { v4 as uuidv4 } from 'uuid';


export function processShapes(pathway, params) {
  let idCount = params.idCount;
  let cx2Data = params.cx2Data;
  
  const annotations = cx2Data[3].networkAttributes[0].__Annotations;
  

  if (pathway.Shape) {
    const shapes = pathway.Shape;
    shapes.forEach(shapes => {
      const graphics = shapes.Graphics[0].$;
      const node = {
        id: idCount,
        x: parseFloat(graphics.CenterX),
        y: parseFloat(graphics.CenterY),
        z: parseInt(graphics.ZOrder, 10),
        v: {
          GraphID: shapes.$.GraphId,
          IsGPMLShape: true,
          name: shapes.$.TextLabel
        }
      };
      cx2Data[4].nodes.push(node);


      let shape = graphics.ShapeType || "Rectangle";
      // console.log(shape);
      console.log(shape);
      const shapetype=  CellShapes.getShape(shape);

       if (!Array.isArray(shapetype) || !shapetype.every(cmd => typeof cmd === 'string')) {
          console.error('shapetype contains non-string elements:', shapetype);
          return;
      }




      const customShape = 'NZ M 0.0 50.0 ' + shapetype.map(cmd => {
      const parts = cmd.split(' ');
       return `C ${parts.slice(1).join(' ')}`;
      }).join(' ') + ' Z';

      console.log(customShape);
        let width = graphics.Width;
        let height = graphics.Height;
        let x = graphics.CenterX;
        let y = graphics.CenterY;
        const newAnnotation = {
        edgeThickness: graphics.LineThickness,
        canvas: 'background',
        fillOpacity: 100.0,
        rotation: graphics.Rotation,
        type: 'org.cytoscape.view.presentation.annotations.ShapeAnnotation',
        uuid: uuidv4(),
        customShape: customShape,
        shapeType: 'CUSTOM',
        edgeColor: -4144960,
        edgeOpacity: 100.0,
        name: 'Ellipse',
        x: x - width/2,
        width: width,
        y: y -height/2,
        z: 0,
        height: height
    }
   
    const annotationString = Object.entries(newAnnotation)
        .map(([key, value]) => `${key}=${value}`)
        .join('|');
    
    annotations.push(annotationString);

      // console.log(shapetype);
      if(shape == "Oval") // cx2 uses ellipse instead of oval
        shape = "ellipse";
      const lineThickness = parseFloat(graphics.LineThickness) || 1;
      const borderThickness = getBorderThickness(shape, lineThickness);
      const fontName = graphics.FontName || "Arial";
      const fontWeight = graphics.FontWeight;
      const fontStyle = graphics.FontStyle;
      const labelFont = constructLabelFont(fontName, fontWeight, fontStyle);

      let fillColor = "#FFFFFF";
      let backgroundOpacity = 1;
      if (graphics.FillColor) {
        if (graphics.FillColor.toLowerCase() === "transparent") {
          fillColor = "#FFFFFF";
          backgroundOpacity = 0;
        } else {
          fillColor = "#" + graphics.FillColor;
          backgroundOpacity = 1;
        }
      }



      const v = {
        NODE_BORDER_WIDTH: borderThickness,
        NODE_LABEL_COLOR: graphics.Color ? "#" + graphics.Color : "#000000",
        NODE_Z_LOCATION: graphics.ZOrder,
        NODE_BORDER_COLOR:  graphics.Color ? "#" + graphics.Color : "#000000",
        NODE_HEIGHT: graphics.Height,
        NODE_SHAPE: shape,
        NODE_LABEL_FONT_FACE: {
          FONT_FAMILY: graphics.FontFamily || "sans-serif",
          FONT_STYLE: graphics.FontStyle || "normal",
          FONT_WEIGHT: graphics.FontWeight || "normal",
          FONT_NAME: labelFont || "Arial",
        },
        NODE_SELECTED_PAINT: "#FFFFCC",
        NODE_LABEL_FONT_SIZE: graphics.FontSize || 12,
        NODE_BACKGROUND_OPACITY: backgroundOpacity,
        NODE_WIDTH: graphics.Width,
      };

      const nodebypass = {
        id: idCount,
        v: v,
      };

      cx2Data[9].nodeBypasses.push(nodebypass);
      idCount += 1;
    });
  }
  params.idCount = idCount;
  params.cx2Data = cx2Data;
  return annotations;
  
};




// const shape =  CellShapes.getShape('Oval'); // or any other shape
// console.log(shape);







