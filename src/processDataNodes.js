import { getBorderThickness, constructLabelFont } from "./auxiliary.js";

export function processDataNodes(pathway, params) {
  let idCount = params.idCount;
  let cx2Data = params.cx2Data;
  let graphIdMapping = params.graphIdMapping;
  let cx2NodeIdCounts = params.cx2NodeIdCounts;
  
  if (pathway.DataNode) {
    pathway.DataNode.forEach(dataNode => {
      const graphics = dataNode.Graphics[0].$;
      const xref = dataNode.Xref && dataNode.Xref[0] ? dataNode.Xref[0].$ : null;
      const xrefId = xref ? xref.ID : null;
      const xrefDatasource = xref ? xref.Database : null;

      let fillColor = "#FFFFFF";
      let transparent = "false";
      if (graphics.FillColor) {
        if (graphics.FillColor.toLowerCase() === "transparent") {
          fillColor = "#FFFFFF";
          transparent = "true";
        } else {
          fillColor = "#" + graphics.FillColor;
          transparent = "false";
        }
      }

      const shape = graphics.ShapeType || "Rectangle";
      const lineThickness = parseFloat(graphics.LineThickness) || 1;
      const borderThickness = getBorderThickness(shape, lineThickness);
      const fontName = graphics.FontName || "Arial";
      const fontWeight = graphics.FontWeight;
      const fontStyle = graphics.FontStyle;
      const labelFont = constructLabelFont(fontName, fontWeight, fontStyle);

      const cx2Node = {
        // id: dataNode.$.GraphId, 
        id: idCount,
        x: parseFloat(graphics.CenterX),
        y: parseFloat(graphics.CenterY),
        z: parseInt(graphics.ZOrder) || 0,
        v: {
          FillColor: fillColor,
          Shape: shape,
          BorderThickness: borderThickness,
          Color: graphics.Color ? "#" + graphics.Color : "#000000",
          GraphID: dataNode.$.GraphId,
          LabelSize: parseInt(graphics.FontSize),
          XrefDatasource: xrefDatasource,
          LabelFont: labelFont,
          Type: dataNode.$.Type,
          Transparent: transparent,
          XrefId: xrefId,
          name: dataNode.$.TextLabel,
          Height: parseFloat(graphics.Height),
          Width: parseFloat(graphics.Width),
        }
      };
      cx2Data[4].nodes.push(cx2Node);
      graphIdMapping[dataNode.$.GraphId] = idCount;
      cx2NodeIdCounts.push(idCount);

      const v = {
        NODE_Z_LOCATION: parseInt(graphics.ZOrder) || 0
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
  params.cx2NodeIdCounts = cx2NodeIdCounts;
};