import { getBorderThickness, constructLabelFont } from "./auxiliary.js";

export function processLabels(pathway, params) {
  let idCount = params.idCount;
  let cx2Data = params.cx2Data;
  let graphIdMapping = params.graphIdMapping;

  if (pathway.Label) {
    pathway.Label.forEach(label => {
      const graphics = label.Graphics[0].$;

      const cx2Label = {
        id: idCount,
        x: parseFloat(graphics.CenterX),
        y: parseFloat(graphics.CenterY),
        z: parseInt(graphics.ZOrder) || 0,
        v: {
          GraphID: label.$.GraphId,
          name: label.$.TextLabel,
        }
      };
      if (!cx2Data.nodes) {
        cx2Data.nodes = [];
      }
      cx2Data[4].nodes.push(cx2Label);
      graphIdMapping[label.$.GraphId] = idCount;

      // rest of the style goes to nodeBypasses
      const shape = label.Graphics[0].$.ShapeType || "None";
      const lineThickness = parseFloat(label.Graphics[0].$.LineThickness) || 1;
      const borderThickness = getBorderThickness(shape, lineThickness);
      const fontName = label.Graphics[0].$.FontName || "Arial";
      const fontWeight = label.Graphics[0].$.FontWeight;
      const fontStyle = label.Graphics[0].$.FontStyle;
      const labelFont = constructLabelFont(fontName, fontWeight, fontStyle);

      const v = {
        NODE_BORDER_WIDTH: borderThickness,
        NODE_Z_LOCATION: parseInt(graphics.ZOrder) || 0,
        NODE_LABEL_COLOR: graphics.Color ? "#" + graphics.Color : "#000000",
        NODE_BORDER_COLOR: graphics.Color ? "#" + graphics.Color : "#000000",
        NODE_HEIGHT: parseFloat(graphics.Height),
        NODE_SHAPE: graphics.ShapeType ? graphics.ShapeType : "None",
        NODE_LABEL_FONT_FACE: {
          FONT_FAMILY: graphics.FontFamily || "sans-serif",
          FONT_STYLE: graphics.FontStyle || "normal",
          FONT_WEIGHT: graphics.FontWeight || "normal",
          FONT_NAME: labelFont || "Arial",
        },
        NODE_SELECTED_PAINT: "#FFFFCC",
        NODE_LABEL_FONT_SIZE: parseInt(graphics.FontSize, 10) || 12,
        NODE_BACKGROUND_OPACITY: 0,
        NODE_WIDTH: parseFloat(graphics.Width)
      };

      const nodebypass = {
        id: idCount,
        v: v
      };

      if (!cx2Data[9].nodeBypasses) {
        cx2Data[9].nodeBypasses = [];
      }

      cx2Data[9].nodeBypasses.push(nodebypass);

      idCount += 1;
    });
  }
  params.idCount = idCount;
  params.cx2Data = cx2Data;
  params.graphIdMapping = graphIdMapping;
};