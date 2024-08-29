import fs from 'fs';
import { parseString } from 'xml2js';
import path from 'path';
import generateVisualProperties from './generateVisualProperties.js';

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
      { "name": "nodes", elementCount: dataNodeCount },
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
        "selected": { "d": "boolean" },
        "IsGPMLShape": {"d": "boolean"}
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
  if (fontWeight || fontStyle) {
    labelFont += "-";
    if (fontWeight)
      labelFont += fontWeight;
    if (fontStyle)
      labelFont += fontStyle;
  }
  labelFont += "MT";
  return labelFont;
};

const graphIdMapping = {};
let idCount = 1;
let cx2NodeIdCounts = [];
let cx2EdgeIdCounts = [];
let z = 0;
let cx2LabelIds = [];

const usedIds = [];
const nodeBypassMap = new Map();

let processDataNodes = function () {
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
      z = parseInt(graphics.ZOrder) || 0;

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
      idCount += 1;


    });
  }
};

const processedLabelIds = new Set();
let processLabels = function () {
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
      cx2LabelIds.push(idCount);

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
        NODE_LABEL_FONT_FACE: {
          FONT_FAMILY: "sans-serif",
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
      processedLabelIds.add(idCount);

      if (!cx2Data[9].nodeBypasses) {
        cx2Data[9].nodeBypasses = [];
      }

      cx2Data[9].nodeBypasses.push(nodebypass);

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
let count = 0;

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
          count++;
          idCount += 1;
        }
      }
    });
  });
});



cx2Data[1].metaData.find(meta => meta.name === "nodes").elementCount = dataNodeCount;


let extractGraphicalLineInfo =  function () {
  const graphicalLineInfo = [];

  if (pathway.GraphicalLine) {
    pathway.GraphicalLine.forEach(graphicalLine => {
      const graphics = graphicalLine.Graphics[0];
      const points = graphics.Point;
      

      points.forEach(point => {

        if (!point.$.GraphId) {
          point.$.GraphId = `generated-${idCount}`;
        }


        const node = {
          id: idCount, 
          x: parseFloat(point.$.X),
          y: parseFloat(point.$.Y),
          z: 0 
        };
         cx2Data[4].nodes.push(node);
         graphIdMapping[point.$.GraphId] = idCount; 
         idCount+=1;

        for (let i = 0; i < points.length - 1; i++) {
           const startGraphId = points[i].$.GraphId;
           const endGraphId = points[i + 1].$.GraphId;

        if (graphIdMapping[startGraphId] !== undefined && graphIdMapping[endGraphId] !== undefined) {
        const cx2Edge = {

          id: idCount,
          s: graphIdMapping[startGraphId], 
          t: graphIdMapping[endGraphId], 

          v: {
            StartArrow: 'Line' ,
            EndArrow: 'Line' ,
            ConnectorType: 'Straight',
            LineThickness: parseFloat(graphics.$.LineThickness),
            LineStyle:  'Solid',
            Color: '#000000',
            interaction:  'Line'
          }
        };
        idCount+=1;
        cx2Data[5].edges.push(cx2Edge);
      }
      };
     
    });
  } 
)}
}

extractGraphicalLineInfo()



let extractShapes =  function () {
  const shapes = result.Shape;
    if (pathway.Shape) {
      const shapes = pathway.Shape;
      shapes.forEach(shape => {
        const graphics = shape.Graphics[0].$;
        const node = {
          id: idCount,
          x: parseFloat(graphics.CenterX),
          y: parseFloat(graphics.CenterY),
          z: parseInt(graphics.ZOrder, 10),
          v: {
            GraphID: shape.$.GraphId,
            IsGPMLShape: true,
            name: shape.$.TextLabel
          }
        };
        cx2Data[4].nodes.push(node);
        idCount += 1;
      });
    }
}

extractShapes();


let processInteractions = function () {
  if (pathway.Interaction) {
    pathway.Interaction.forEach(interaction => {
      const points = interaction.Graphics[0].Point;

      const start = points[0];
      const end = points[1];
      const xref = interaction.Xref ? { database: interaction.Xref[0].$.Database, id: interaction.Xref[0].$.ID } : { database: '', id: '' };
      const startArrowHead = start.$.ArrowHead ? start.$.ArrowHead : "None";
      const endArrowHead = end.$.ArrowHead ? end.$.ArrowHead : "None";
      let shape = "Line";
      if (interaction.Graphics && interaction.Graphics[0].Anchor && interaction.Graphics[0].Anchor.length > 0) {
        const anchor = interaction.Graphics[0].Anchor[0];
        const shape = anchor.$.Shape
      }

      if (graphIdMapping[start.$.GraphRef] && graphIdMapping[end.$.GraphRef]) {
        const attribute = interaction.Attribute && interaction.Attribute.find(attr => attr.$.Key === "org.pathvisio.DoubleLineProperty");
        const lineStyle = attribute ? attribute.$.Value : interaction.Graphics[0].$.LineStyle === 'Broken' ? "Dashed" : "Solid";

        const cx2Edge = {

          id: idCount,
          s: graphIdMapping[start.$.GraphRef],
          t: graphIdMapping[end.$.GraphRef],
          v: {
            StartArrow: startArrowHead === 'None' ? 'Line' : startArrowHead,
            EndArrow: endArrowHead === 'None' ? 'Line' : endArrowHead,
            ConnectorType: "Straight",
            LineThickness: parseFloat(interaction.Graphics[0].$.LineThickness),
            LineStyle:  lineStyle,
            Color: interaction.Graphics[0].$.Color ? '#' + interaction.Graphics[0].$.Color : "#000000",
            interaction: endArrowHead === 'None' ? 'Line' : endArrowHead
          }
        };
        cx2Data[5].edges.push(cx2Edge);
        cx2EdgeIdCounts.push(idCount);
        idCount += 1;
      }
    });

  }
};




let generateVisualEditorProperties = function () {
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


let generateVisualPropertiesData =  function () {
  const visualProperties = generateVisualProperties();

  cx2Data[7].visualProperties.push(visualProperties);
};


processDataNodes();
processLabels();
processInteractions();
generateVisualPropertiesData();
generateVisualEditorProperties();

if (interactions) {

  interactions.forEach(interaction => {
    const graphics = interaction.Graphics[0];
    const points = graphics.Point;
    let style = 1;

    points.forEach(point => {
      const arrowHead = point.$.ArrowHead;
      const graphRef = point.$.GraphRef;
      if (anchors.includes(graphRef)) {
        let v;
        if (style <= count) {
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
        style++;

        const id = graphIdMapping[graphRef]
        if (!nodeBypassMap.has(id)) {

          const nodebypass = {
            id: id,
            v: v
          };

          nodeBypassMap.set(id, nodebypass);
          usedIds.push(id);

          cx2Data[9].nodeBypasses.push(nodebypass);

        }

      }
    });
  });
}

cx2NodeIdCounts.forEach(id => {

  const v = {
    NODE_Z_LOCATION: z
  };


  const nodebypass = {
    id: id,
    v: v
  };
  cx2Data[9].nodeBypasses.push(nodebypass);
});


cx2EdgeIdCounts.forEach(id => {

  const edgebypass = {
    id: id,
    v: {
      EDGE_WIDTH: 1
    }
  }
  cx2Data[10].edgeBypasses.push(edgebypass);
});


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
