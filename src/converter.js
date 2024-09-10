import fs from 'fs';
import { parseString } from 'xml2js';
import path from 'path';
import { generateVisualProperties } from './generateVisualProperties.js';
import { processDataNodes } from './processDataNodes.js';
import { processLabels } from './processLabels.js';
import { processInteractions } from './processInteractions.js';
import { processGraphicalLines } from './processGraphicalLines.js';
import { processGroups } from './processGroups.js';
import { processShapes } from './processShapes.js';
import { processStates } from './processStates.js';

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
let count = 0;


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
        "IsGPMLShape": {"d": "boolean"},
        "parentsymbol": {"d": "string"},
        "parentid": {"d": "string"},
        "direction": {"d": "string"},
        "ptm": {"d": "string"},
        "position": {"d": "string"},
        "site": {"d": "string"},
        "sitegrpid": {"d": "string"}
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

const graphIdMapping = {};
let idCount = 1;
let cx2NodeIdCounts = [];
let cx2EdgeIdCounts = [];
let z = 0;

const usedIds = [];
const nodeBypassMap = new Map();

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
          // z: parseInt(interaction.Graphics[0].$.ZOrder) || 0
          z: 0
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

let params = {idCount: idCount, cx2Data: cx2Data, graphIdMapping: graphIdMapping, cx2NodeIdCounts: cx2NodeIdCounts, cx2EdgeIdCounts: cx2EdgeIdCounts};

processDataNodes(pathway, params);
processStates(pathway, params );
processLabels(pathway, params);
processGraphicalLines(pathway, params);
processGroups(pathway, params);
processInteractions(pathway, params);
// processShapes(pathway, params);
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

/* cx2NodeIdCounts.forEach(id => {

  const v = {
    NODE_Z_LOCATION: 32768
  };


  const nodebypass = {
    id: id,
    v: v
  };
  cx2Data[9].nodeBypasses.push(nodebypass);
}); */


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
