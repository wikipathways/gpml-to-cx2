const fs = require('fs');
const parseString = require('xml2js').parseString;
const path = require('path');

const gpmlFilePath = process.argv[2];

if (!gpmlFilePath) {
  console.error('Usage: node runConverter.js <gpmlFilePath>');
  process.exit(1);
}

let gpmlContent = "";
let result = "";

// Read GPML file content
try {
  gpmlContent = fs.readFileSync(gpmlFilePath, 'utf-8');
} catch (err) {
  console.error(`Error reading GPML file: ${err.message}`);
  process.exit(1);
}

// Parse GPML XML
parseString(gpmlContent, (err, resultXML) => {
  if (err) {
    console.error(`Error parsing GPML XML: ${err.message}`);
    process.exit(1);
  }
  result = resultXML;
});

// Extract Pathway information
const pathway = result.Pathway;
if (!pathway) {
  console.error('Pathway element not found in GPML XML.');
  process.exit(1);
}

const commentText = result.Pathway.Comment ? result.Pathway.Comment[0]._ : "";
let dataNodeCount = result.Pathway.DataNode ? result.Pathway.DataNode.length : 0;
const edgesCount = result.Pathway.Interaction ? result.Pathway.Interaction.length : 0;


// Construct CX2 JSON data
const cx2Data = [
  {
    "CXVersion": "2.0",
    "hasFragments": false
  },
  {
    "metaData": [
      { "name": "attributeDeclarations", elementCount: 1 },
      { "name": "networkAttributes", elementCount: 1 },
      { "name": "edges", elementCount: edgesCount },
      { "name": "nodes", elementCount: dataNodeCount  },
      { "name": "visualProperties", elementCount: 1 },
      { "name": "visualEditorProperties", elementCount: 1 },
      { "name": "edgeBypasses" },
      { "name": "nodeBypasses" },
      { "name": "tableVisualProperties" }
    ]
  },
  {
    "attributeDeclarations": [{
      "nodes": {
        "FillColor": { "d": "string" },
        "Shape": { "d": "string" },
        "BorderThickness": { "d": "double" },
        "BorderStyle": { "d": "string" },
        "GraphID": { "d": "string" },
        "Color": { "d": "string" },
        "ChEBI": { "d": "string" },
        "LabelSize": { "d": "double" },
        "Node Size": { "d": "double" },
        "Border Width": { "d": "double" },
        "XrefDatasource": { "d": "string" },
        "LabelFont": { "d": "string" },
        "Type": { "d": "string" },
        "Transparent": { "d": "string" },
        "XrefId": { "d": "string" },
        "GraphId": { "d": "string" },
        "name": { "d": "string" },
        "Height": { "d": "double" },
        "Ensembl": { "d": "string" },
        "Width": { "d": "double" },
        "selected": { "d": "boolean" }
      },
      "networkAttributes": {
        "shared name": { "d": "string" },
        "description": { "d": "string" },
        "__Annotations": { "d": "list_of_string" },
        "name": { "d": "string" },
        "selected": { "d": "boolean" }
      },
      "edges": {
        "shared name": { "d": "string" },
        "StartArrow": { "d": "string" },
        "EndArrow": { "d": "string" },
        "ConnectorType": { "d": "string" },
        "shared interaction": { "d": "string" },
        "LineThickness": { "d": "double" },
        "LineStyle": { "d": "string" },
        "Color": { "d": "string" },
        "Source Arrow Shape": { "d": "string" },
        "name": { "d": "string" },
        "interaction": { "d": "string" },
        "Target Arrow Shape": { "d": "string" },
        "Width": { "d": "double" },
        "selected": { "d": "boolean" },
        "WP.type": { "d": "string" }
      }
    }]
  },
  {
    "networkAttributes": [
      {
        "name": pathway.$.Name,
        "description": commentText
      }
    ]
  },
  {
    "nodes": []
  },
  {
    "edges": []
  },
  {
    "visualEditorProperties": []
  },
  {
    "visualProperties": []
  },
  {
    "labels": []
  },
  {
    "nodeBypasses": []
  },
  {
    "edgeBypasses": []
  },

  {
    status: [
      {
        "success": true
      }
    ]
  }
];




function getBorderThickness(shape, lineThickness) {
  if (shape === "None") {
    return 0;
  }
  return lineThickness;
}

function constructLabelFont(fontName, fontWeight, fontStyle) {
  let labelFont = fontName;
  if(fontWeight || fontStyle) {
    labelFont += "-";
    if(fontWeight)
      labelFont += fontWeight;
    if(fontStyle)
      labelFont += fontStyle;
  }
  labelFont += "MT";
  return labelFont;
};

const graphIdMapping = {};
let idCount = 1;

let processDataNodes = function() {
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
      idCount += 1;
  
    });
  }
};



let processLabels = function() {
  if (pathway.Label) {
    pathway.Label.forEach(label => {
      const graphics = label.Graphics[0].$;

      let fillColor = "#FFFFFF";
      let transparent = "true";
      if (graphics.FillColor) {
        if (graphics.FillColor.toLowerCase() === "transparent") {
          fillColor = "#FFFFFF";
          transparent = "true";
        } else {
          fillColor = "#" + graphics.FillColor;
          transparent = "false";
        }
      }
      const shape = graphics.ShapeType || "None";
      const lineThickness = parseFloat(graphics.LineThickness) || 1;
      const borderThickness = getBorderThickness(shape, lineThickness);
      const fontName = graphics.FontName || "Arial";
      const fontWeight = graphics.FontWeight;
      const fontStyle = graphics.FontStyle;
      const labelFont = constructLabelFont(fontName, fontWeight, fontStyle);

      const cx2Label = {
        id: idCount,
        x: parseFloat(graphics.CenterX),
        y: parseFloat(graphics.CenterY),
        z: parseInt(graphics.ZOrder) || 0,
        v: {
          GraphID: label.$.GraphId,
          name: label.$.TextLabel,
          FillColor: fillColor,
          Transparent: transparent,
          Shape: shape,
          BorderThickness: borderThickness,
          Height: parseFloat(graphics.Height),
          Width: parseFloat(graphics.Width),
          Color: graphics.Color ? "#" + graphics.Color : "#000000",
          LabelSize: parseInt(graphics.FontSize),
          LabelFont: labelFont,
        }
      };
      if (!cx2Data.nodes) {
        cx2Data.nodes = [];
      }
      cx2Data[4].nodes.push(cx2Label);
      graphIdMapping[label.$.GraphId] = idCount;
      idCount += 1;
    });
  }
};


 const anchors = [];
 const interactions = result.Pathway.Interaction || [];
    interactions.forEach(interaction => {
      const graphics = interaction.Graphics || [];
      graphics.forEach(graphic => {
        const anchorElements = graphic.Anchor || [];
        anchorElements.forEach(anchor => {
          anchors.push(anchor.$.GraphId);
        });
      });
    });


  
    const uniqueNodes = new Set();

interactions.forEach(interaction => {
  const graphics = interaction.Graphics || [];
  graphics.forEach(graphic => {
    const points = graphic.Point || [];
    points.forEach(point => {
      if (anchors.includes(point.$.GraphRef)) {
        const node = {
          id: idCount,
          x: parseFloat(point.$.X),
          y: parseFloat(point.$.Y),
          z: parseInt(interaction.Graphics[0].$.ZOrder) || 0
        };
        const nodeKey = `${node.x},${node.y},${node.z}`;
        if (!uniqueNodes.has(nodeKey)) {
          uniqueNodes.add(nodeKey);
          cx2Data[4].nodes.push(node);
          graphIdMapping[point.$.GraphRef] = idCount;
          dataNodeCount++;
          idCount += 1;
        }
      }
    });
  });
});



cx2Data[1].metaData.find(meta => meta.name === "nodes").elementCount = dataNodeCount;







let processInteractions = function() {
  if (pathway.Interaction) {
    pathway.Interaction.forEach(interaction => {
      const points = interaction.Graphics[0].Point;

  

      
      const start = points[0];
      const end = points[1];
      const xref = interaction.Xref ? { database: interaction.Xref[0].$.Database, id: interaction.Xref[0].$.ID } : { database: '', id: '' };
      const arrowHead = end.$.ArrowHead ? end.$.ArrowHead : "None";
      let shape = "Line";
      if (interaction.Graphics && interaction.Graphics[0].Anchor && interaction.Graphics[0].Anchor.length > 0) {
        const anchor = interaction.Graphics[0].Anchor[0];
        const shape = anchor.$.Shape
      }


      if (graphIdMapping[start.$.GraphRef] && graphIdMapping[end.$.GraphRef]) {

      const cx2Edge = {

        id: idCount,
        s: graphIdMapping[start.$.GraphRef],
        t: graphIdMapping[end.$.GraphRef],
        v: {
          StartArrow: "Line",
          EndArrow: arrowHead === 'None' ? 'Line' : arrowHead,
          ConnectorType: "Straight",
          LineThickness: parseFloat(interaction.Graphics[0].$.LineThickness) ,
          LineStyle: "Solid",
          Color: "#000000",
        
          interaction: arrowHead === 'None' ? 'Line' : arrowHead
        }
      };
      cx2Data[5].edges.push(cx2Edge);
      idCount += 1;
    }
    });
    
  }
};

let generateVisualProperties = function() {
  const visualProperties =
  {
    "default": {
      "edge": {
        "EDGE_SOURCE_ARROW_SIZE": 6,
        "EDGE_SOURCE_ARROW_SELECTED_PAINT": "#FFFF00",
        "EDGE_LABEL_OPACITY": 1,
        "EDGE_TARGET_ARROW_SELECTED_PAINT": "#FFFF00",
        "EDGE_TARGET_ARROW_SHAPE": "none",
        "EDGE_LABEL_BACKGROUND_OPACITY": 1,
        "EDGE_LABEL_POSITION": {
          "JUSTIFICATION": "center",
          "MARGIN_X": 0,
          "MARGIN_Y": 0,
          "EDGE_ANCHOR": "C",
          "LABEL_ANCHOR": "C"
        },
        "EDGE_Z_ORDER": 0,
        "EDGE_LABEL_MAX_WIDTH": 200,
        "EDGE_LABEL_BACKGROUND_COLOR": "#B6B6B6",
        "EDGE_LABEL_ROTATION": 0,
        "EDGE_VISIBILITY": "element",
        "EDGE_LABEL_FONT_SIZE": 10,
        "EDGE_LABEL_COLOR": "#000000",
        "EDGE_SELECTED_PAINT": "#FF0000",
        "EDGE_SELECTED": "false",
        "EDGE_STACKING_DENSITY": 0.5,
        "EDGE_SOURCE_ARROW_COLOR": "#404040",
        "EDGE_TARGET_ARROW_COLOR": "#404040",
        "EDGE_STROKE_SELECTED_PAINT": "#FF0000",
        "EDGE_WIDTH": 2,
        "EDGE_SOURCE_ARROW_SHAPE": "none",
        "EDGE_LINE_COLOR": "#404040",
        "EDGE_OPACITY": 1,
        "EDGE_LABEL_BACKGROUND_SHAPE": "NONE",
        "EDGE_LABEL_FONT_FACE": {
          "FONT_FAMILY": "sans-serif",
          "FONT_STYLE": "normal",
          "FONT_WEIGHT": "normal",
          "FONT_NAME": "Dialog.plain"
        },
        "EDGE_STACKING": "AUTO BEND",
        "EDGE_LABEL_AUTOROTATE": false,
        "EDGE_LINE_STYLE": "solid",
        "EDGE_CURVED": true,
        "EDGE_TARGET_ARROW_SIZE": 6
      },
      "network": {
        "NETWORK_BACKGROUND_COLOR": "#FFFFFF"
      },
      "node": {
        "NODE_Y_LOCATION": 0,
        "NODE_BACKGROUND_COLOR": "#FFFFFF",
        "NODE_LABEL_BACKGROUND_COLOR": "#B6B6B6",
        "NODE_WIDTH": 75,
        "NODE_CUSTOMGRAPHICS_SIZE_7": 50,
        "NODE_CUSTOMGRAPHICS_SIZE_6": 50,
        "COMPOUND_NODE_SHAPE": "ROUND_RECTANGLE",

        "NODE_Z_LOCATION": 0,
        "NODE_LABEL_POSITION": {
          "HORIZONTAL_ALIGN": "center",
          "VERTICAL_ALIGN": "center",
          "HORIZONTAL_ANCHOR": "center",
          "VERTICAL_ANCHOR": "center",
          "MARGIN_X": 0,
          "MARGIN_Y": 0,
          "JUSTIFICATION": "center"
        },
        "NODE_CUSTOMGRAPHICS_SIZE_5": 50,
        "NODE_CUSTOMGRAPHICS_SIZE_4": 50,
        "NODE_CUSTOMGRAPHICS_SIZE_3": 50,
        "NODE_CUSTOMGRAPHICS_SIZE_2": 50,
        "NODE_VISIBILITY": "element",
        "NODE_CUSTOMGRAPHICS_SIZE_1": 50,
        "NODE_BORDER_STYLE": "solid",
        "NODE_BACKGROUND_OPACITY": 1,
        "NODE_LABEL_COLOR": "#000000",
        "NODE_SELECTED": false,
        "NODE_BORDER_COLOR": "#CCCCCC",
        "NODE_CUSTOMGRAPHICS_POSITION_8": {
          "JUSTIFICATION": "center",
          "MARGIN_X": 0,
          "MARGIN_Y": 0,
          "ENTITY_ANCHOR": "C",
          "GRAPHICS_ANCHOR": "C"
        },

        "NODE_CUSTOMGRAPHICS_POSITION_9": {
          "JUSTIFICATION": "center",
          "MARGIN_X": 0,
          "MARGIN_Y": 0,
          "ENTITY_ANCHOR": "C",
          "GRAPHICS_ANCHOR": "C"
        },
        "NODE_CUSTOMGRAPHICS_POSITION_4": {
          "JUSTIFICATION": "center",
          "MARGIN_X": 0,
          "MARGIN_Y": 0,
          "ENTITY_ANCHOR": "C",
          "GRAPHICS_ANCHOR": "C"
        },

        "NODE_SHAPE": "ellipse",
        "NODE_CUSTOMGRAPHICS_POSITION_5": {
          "JUSTIFICATION": "center",
          "MARGIN_X": 0,
          "MARGIN_Y": 0,
          "ENTITY_ANCHOR": "C",
          "GRAPHICS_ANCHOR": "C"
        },
        "NODE_CUSTOMGRAPHICS_POSITION_6": {
          "JUSTIFICATION": "center",
          "MARGIN_X": 0,
          "MARGIN_Y": 0,
          "ENTITY_ANCHOR": "C",
          "GRAPHICS_ANCHOR": "C"
        },
        "NODE_CUSTOMGRAPHICS_POSITION_7": {
          "JUSTIFICATION": "center",
          "MARGIN_X": 0,
          "MARGIN_Y": 0,
          "ENTITY_ANCHOR": "C",
          "GRAPHICS_ANCHOR": "C"
        },
        "NODE_LABEL_FONT_SIZE": 12,
        "NODE_X_LOCATION": 0,
        "NODE_CUSTOMGRAPHICS_POSITION_1": {
          "JUSTIFICATION": "center",
          "MARGIN_X": 0,
          "MARGIN_Y": 0,
          "ENTITY_ANCHOR": "C",
          "GRAPHICS_ANCHOR": "C"
        },
        "NODE_BORDER_OPACITY": 1,
        "NODE_CUSTOMGRAPHICS_POSITION_2": {
          "JUSTIFICATION": "center",
          "MARGIN_X": 0,
          "MARGIN_Y": 0,
          "ENTITY_ANCHOR": "C",
          "GRAPHICS_ANCHOR": "C"
        },
        "NODE_CUSTOMGRAPHICS_SIZE_9": 50,

        "NODE_CUSTOMGRAPHICS_POSITION_3": {
          "JUSTIFICATION": "center",
          "MARGIN_X": 0,
          "MARGIN_Y": 0,
          "ENTITY_ANCHOR": "C",
          "GRAPHICS_ANCHOR": "C"
        },
        "NODE_LABEL_ROTATION": 0,
        "NODE_CUSTOMGRAPHICS_SIZE_8": 50,
        "NODE_BORDER_WIDTH": 1,
        "NODE_LABEL_OPACITY": 1,
        "NODE_HEIGHT": 35,
        "NODE_LABEL_BACKGROUND_SHAPE": "NONE",
        "COMPOUND_NODE_PADDING": "10.0",
        "NODE_LABEL_BACKGROUND_OPACITY": 1,
        "NODE_LABEL_FONT_FACE": {
          "FONT_FAMILY": "sans-serif",
          "FONT_STYLE": "normal",
          "FONT_WEIGHT": "normal",
          "FONT_NAME": "SansSerif.plain"
        },
        "NODE_SELECTED_PAINT": "#FFFF00",
        "NODE_LABEL_MAX_WIDTH": 200,
      }
    },
     "edgeMapping": {
      "EDGE_TARGET_ARROW_SHAPE": {
        "type": "DISCRETE",
        "definition": {
          "map": [
            { 
              "v": "Arrow",
              "vp": "triangle"
            },
            { 
              "v": "mim-branching-right",
              "vp": "triangle-cross" 
            },
            { 
              "v": "mim-covalent-bond", 
              "vp": "triangle-cross" 
            },
            { 
              "v": "mim-branching-left", 
              "vp": "triangle-cross" 
            },
            { 
              "v": "mim-transcription-translation", 
              "vp": "triangle" 
            },
            { 
              "v": "mim-binding", 
              "vp": "triangle" 
            },
            { 
              "v": "Line", 
              "vp": "none" 
            },
            { 
              "v": "mim-cleavage", 
              "vp": "diamond"
            },
            { 
              "v": "mim-gap", 
              "vp": "triangle" 
            },
            { 
              "v": "mim-stimulation", 
              "vp": "triangle" 
            },
            { 
              "v": "mim-catalysis", 
              "vp": "circle" 
            },
            { 
              "v": "mim-inhibition", 
              "vp": "tee" 
            },
            { 
              "v": "TBar", 
              "vp": "tee" 
            },
            { 
              "v": "mim-modification", 
              "vp": "triangle" 
            },
            { 
              "v": "mim-necessary-stimulation",
              "vp": "triangle-cross" 
            },
            { 
              "v": "mim-conversion", 
              "vp": "triangle" 
            }
          ],
          "attribute": "EndArrow",
          "type": "string"
        }
      },
      "EDGE_WIDTH": {
        "type": "PASSTHROUGH",
        "definition": {
          "attribute": "LineThickness",
          "type": "double"
        }
      },
      "EDGE_SOURCE_ARROW_SHAPE": {
        "type": "DISCRETE",
        "definition": {
          "map": [
            {
              "v": "Arrow",
              "vp": "triangle"
            },
            {
              "v": "mim-branching-right",
              "vp": "triangle-cross"
            },
            {
              "v": "mim-covalent-bond",
              "vp": "triangle-cross"
            },
            {
              "v": "mim-branching-left",
              "vp": "triangle-cross"
            },
            {
              "v": "mim-transcription-translation",
              "vp": "triangle"
            },
            {
              "v": "mim-binding",
              "vp": "triangle"
            },
            {
              "v": "Line",
              "vp": "none"
            },
            {
              "v": "mim-cleavage",
              "vp": "diamond"
            },
            {
              "v": "mim-gap",
              "vp": "triangle"
            },
            {
              "v": "mim-stimulation",
              "vp": "triangle"
            },
            {
              "v": "mim-catalysis",
              "vp": "circle"
            },
            {
              "v": "mim-inhibition",
              "vp": "tee"
            },
            {
              "v": "TBar",
              "vp": "tee"
            },
            {
              "v": "mim-modification",
              "vp": "triangle"
            },
            {
              "v": "mim-necessary-stimulation",
              "vp": "triangle-cross"
            },
            {
              "v": "mim-conversion",
              "vp": "triangle"
            }
          ],
          "attribute": "StartArrow",
          "type": "string"
        }
      },
      "EDGE_TOOLTIP": {
        "type": "DISCRETE",
        "definition": {
          "map": [
            {
              "v": "Elbow",
              "vp": "Elbow"
            },
            {
              "v": "Curved",
              "vp": "Curved"
            },
            {
              "v": "Straight",
              "vp": "Straight"
            }
          ],
          "attribute": "ConnectorType",
          "type": "string"
        }
      },
      "EDGE_LINE_COLOR": {
        "type": "PASSTHROUGH",
        "definition": {
          "attribute": "Color",
          "type": "string"
        }
      },
      "EDGE_SOURCE_ARROW_COLOR": {
        "type": "PASSTHROUGH",
        "definition": {
          "attribute": "Color",
          "type": "string"
        }
      },
      "EDGE_TARGET_ARROW_COLOR": {
        "type": "PASSTHROUGH",
        "definition": {
          "attribute": "Color",
          "type": "string"
        }
      },
      "EDGE_LINE_STYLE": {
        "type": "DISCRETE",
        "definition": {
          "map": [
            {
              "v": "Dots",
              "vp": "dotted"
            },
            {
              "v": "Double",
              "vp": "solid"
            },
            {
              "v": "Solid",
              "vp": "solid"
            },
            {
              "v": "Dashed",
              "vp": "dashed"
            }
          ],
          "attribute": "LineStyle",
          "type": "string"
        }
      }
    },
    "nodeMapping": {
      "NODE_BORDER_WIDTH": {
        "type": "PASSTHROUGH",
        "definition": {
          "attribute": "BorderThickness",
          "type": "double"
        }
      },
      "NODE_LABEL": {
        "type": "PASSTHROUGH",
        "definition": {
          "attribute": "name",
          "type": "string"
        }
      },
      "NODE_LABEL_COLOR": {
        "type": "PASSTHROUGH",
        "definition": {
          "attribute": "Color",
          "type": "string"
        }
      },
      "NODE_BORDER_COLOR": {
        "type": "PASSTHROUGH",
        "definition": {
          "attribute": "Color",
          "type": "string"
        }
      },
      "NODE_HEIGHT": {
        "type": "PASSTHROUGH",
        "definition": {
          "attribute": "Height",
          "type": "double"
        }
      },
      "NODE_BACKGROUND_COLOR": {
        "type": "PASSTHROUGH",
        "definition": {
          "attribute": "FillColor",
          "type": "string"
        }
      },
      "NODE_SHAPE": {
        "type": "DISCRETE",
        "definition": {
          "map": [
            {
              "v": "Nucleus",
              "vp": "Nucleus"
            },
            {
              "v": "Hexagon",
              "vp": "hexagon"
            },
            {
              "v": "Ellipse",
              "vp": "ellipse"
            },
            {
              "v": "Brace",
              "vp": "Brace"
            },
            {
              "v": "RoundRectangle",
              "vp": "round-rectangle"
            },
            {
              "v": "Rectangle",
              "vp": "rectangle"
            },
            {
              "v": "Triangle",
              "vp": "triangle"
            },
            {
              "v": "Octagon",
              "vp": "octagon"
            },
            {
              "v": "Sarcoplasmic Reticulum",
              "vp": "Sarcoplasmic Reticulum"
            },
            {
              "v": "Endoplasmic Reticulum",
              "vp": "Endoplasmic Reticulum"
            },
            {
              "v": "Golgi Apparatus",
              "vp": "Golgi Apparatus"
            },
            {
              "v": "Mitochondria",
              "vp": "Mitochondria"
            },
            {
              "v": "Arc",
              "vp": "Arc"
            },
            {
              "v": "Oval",
              "vp": "ellipse"
            },
            {
              "v": "Pentagon",
              "vp": "hexagon"
            },
            {
              "v": "Organelle",
              "vp": "round-rectangle"
            },
            {
              "v": "Cell",
              "vp": "Cell"
            },
            {
              "v": "RoundedRectangle",
              "vp": "round-rectangle"
            }
          ],
          "attribute": "Shape",
          "type": "string"
        }
      },
      "NODE_LABEL_FONT_FACE": {
        "type": "PASSTHROUGH",
        "definition": {
          "attribute": "LabelFont",
          "type": "string"
        }
      },
      "NODE_LABEL_FONT_SIZE": {
        "type": "PASSTHROUGH",
        "definition": {
          "attribute": "LabelSize",
          "type": "double"
        }
      },
      "NODE_BACKGROUND_OPACITY": {
        "type": "DISCRETE",
        "definition": {
          "map": [
            {
              "v": "true",
              "vp": 0
            },
            {
              "v": "false",
              "vp": 1
            }
          ],
          "attribute": "Transparent",
          "type": "string"
        }
      },
      "NODE_WIDTH": {
        "type": "PASSTHROUGH",
        "definition": {
          "attribute": "Width",
          "type": "double"

        }
      }
    }
   
  }

  if (!cx2Data.visualProperties) {
    cx2Data.visualProperties = [];
  }

  cx2Data[7].visualProperties.push(visualProperties);
};

let generateVisualEditorProperties = function() {
  const visualEditorProperties =
  {
    properties: {
      nodeSizeLocked: false,
      arrowColorMatchesEdge: true,
      nodeCustomGraphicsSizeSync: true,
      NETWORK_CENTER_Y_LOCATION: 0,
      NETWORK_CENTER_X_LOCATION: 0,
      NETWORK_SCALE_FACTOR: 1
    }
  };

  if (!cx2Data.visualEditorProperties) {
    cx2Data.visualEditorProperties = [];
  }

  cx2Data[6].visualEditorProperties.push(visualEditorProperties);
};

processDataNodes();
processLabels();
processInteractions();
generateVisualProperties();
generateVisualEditorProperties();




  if (!cx2Data[9].nodeBypasses) {
    cx2Data[9].nodeBypasses = [];
  }
  const nodeBypassMap = new Map();
  if (interactions) {
  
    interactions.forEach(interaction => {
      const graphics = interaction.Graphics[0];
      const points = graphics.Point;

      points.forEach(point => {
        const arrowHead = point.$.ArrowHead;
        const graphRef = point.$.GraphRef;
    if (anchors.includes(graphRef)) {
        let v;
        if (arrowHead != 'Arrow') {
          v = {
            "NODE_CUSTOMGRAPHICS_SIZE_7": 1,
            "NODE_CUSTOMGRAPHICS_SIZE_6": 1,
            "NODE_CUSTOMGRAPHICS_SIZE_5": 1,
            "NODE_CUSTOMGRAPHICS_SIZE_4": 1,
            "NODE_CUSTOMGRAPHICS_SIZE_3": 1,
            "NODE_CUSTOMGRAPHICS_SIZE_2": 1,
            "NODE_CUSTOMGRAPHICS_SIZE_1": 1,
            "NODE_HEIGHT": 1,
            "NODE_SHAPE": "rectangle",
            "NODE_WIDTH": 1,
            "NODE_CUSTOMGRAPHICS_SIZE_9": 1,
            "NODE_CUSTOMGRAPHICS_SIZE_8": 1
          };
        } else {
          v = {
            NODE_Z_LOCATION: parseInt(graphics.$.ZOrder) || 0
          };
        }

        const id = graphIdMapping[graphRef]
         if (!nodeBypassMap.has(id)) {
        const nodebypass = {
          id: id, 
          v: v
        };
        nodeBypassMap.set(id, nodebypass);
        cx2Data[9].nodeBypasses.push(nodebypass);

      }
        
      }
      });
    });
  }
   

const cx2DataArray = cx2Data;

// Convert CX2 data to JSON string
const cx2JsonString = JSON.stringify(cx2DataArray, null, 2);

// Write CX2 data to file
// const outputPath = `${gpmlFilePath}.cx2`;
const outputPath = path.join(path.dirname(gpmlFilePath), path.basename(gpmlFilePath, '.gpml') + '.cx2');
fs.writeFile(outputPath, cx2JsonString, 'utf-8', (err) => {
  if (err) {
    console.error(`Error writing CX2 file: ${err.message}`);
    process.exit(1);
  }
  console.log(`CX2 data successfully written to: ${outputPath}`);
});
