const fs = require('fs');
const parseString = require('xml2js').parseString;
const path = require('path');


const gpmlFilePath = process.argv[2];

if (!gpmlFilePath) {
  console.error('Usage: node runConverter.js <gpmlFilePath>');
  process.exit(1);
}

// const cxDescriptor = {
//   "CXVersion": "2.0",
//   "hasFragments": false
// };


// Read GPML file content
fs.readFile(gpmlFilePath, 'utf-8', (err, gpmlContent) => {
  if (err) {
    console.error(`Error reading GPML file: ${err.message}`);
    process.exit(1);
  }

  // Parse GPML XML
  parseString(gpmlContent, (err, result) => {
    if (err) {
      console.error(`Error parsing GPML XML: ${err.message}`);
      process.exit(1);
    }

    // Extract Pathway information
    const pathway = result.Pathway;
    if (!pathway) {
      console.error('Pathway element not found in GPML XML.');
      process.exit(1);
    }

      const commentText = result.Pathway.Comment[0]._;
      const dataNodeCount = result.Pathway.DataNode.length;
      const edgesCount = result.Pathway.Interaction.length;

    // Convert to CX2 format
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
    { "name": "nodes", elementCount: dataNodeCount-1 },
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
    "Border Width": { "d": "double"},
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
        "visualConfig": []
},
{
        "labels": []
},
{
        "edgeMapping": []
}
,        
      // },
{  
       status: [ 
        {
          "success": true
        }
      ]
}

];


let nodeId = 1;




        if (pathway.DataNode) {
      pathway.DataNode.forEach(dataNode => {
         const xref = dataNode.Xref && dataNode.Xref[0] ? dataNode.Xref[0].$ : null;
         const xrefId = xref ? xref.ID : null;
         const xrefDatasource = xref ? xref.Database : null;
         const ensemblId = xrefDatasource === "Ensembl" ? xrefId : "";

        const cx2Node = {
          // id: dataNode.$.GraphId, 
          id: nodeId,
          x: parseFloat(dataNode.Graphics[0].$.CenterX), 
          y: parseFloat(dataNode.Graphics[0].$.CenterY), 
          z: parseInt(dataNode.Graphics[0].$.ZOrder) || 0, 
          v: {
            FillColor: dataNode.Graphics[0].$.FillColor || "Transparent",
            Shape: dataNode.Graphics[0].$.Shape || "None",
            BorderThickness: parseFloat(dataNode.Graphics[0].$.BorderThickness) || 0,
            Color: dataNode.Graphics[0].$.Color || "#000000",
            ChEBI: xrefId,
            GraphId: dataNode.$.GraphId,
            "Border Width" : parseFloat(dataNode.Graphics[0].$.BorderThickness) || 0,
            Width: parseFloat(dataNode.Graphics[0].$.Width) ||0,
            LabelSize: parseInt(dataNode.Graphics[0].$.LabelSize),
            XrefDatasource: xrefDatasource,
            LabelFont: dataNode.Graphics[0].$.LabelFont  || "Dialog.plain",
            Type: dataNode.$.Type,
            Transparent: dataNode.Graphics[0].$.Transparent || "false",
            XrefId: xrefId,
            name: dataNode.$.TextLabel,
            Height: parseFloat(dataNode.Graphics[0].$.Height),
            Ensembl: ensemblId|| "",
            "Node Size": parseFloat(dataNode.Graphics[0].$.Width),
          
          }
        };
        cx2Data[4].nodes.push(cx2Node);
        nodeId +=1;
      });
    }


    let edgeId = 1;

    if (pathway.Interaction) {
  pathway.Interaction.forEach(interaction => {
    const points = interaction.Graphics[0].Point;
    const start = points[0];
    const end = points[1];
    const xref = interaction.Xref ? { database: interaction.Xref[0].$.Database, id: interaction.Xref[0].$.ID } : { database: '', id: '' };
    const arrowHead = end.$.ArrowHead ? end.$.ArrowHead : "None"; 
    let shape = "None";
    if (interaction.Graphics && interaction.Graphics[0].Anchor && interaction.Graphics[0].Anchor.length > 0) {
    const anchor = interaction.Graphics[0].Anchor[0];
    const shape = anchor.$.Shape
    }
    // New cx2Edge structure
    const cx2Edge = {
      // id: interaction.$.GraphId,
      id: edgeId,
      s: start.$.GraphRef,
      t: end.$.GraphRef,
      v: {
        LineStyle: "Solid",
        "Source Arrow Shape": shape,
        Color: "#000000",
        interaction: arrowHead || "Straight",
        "Target Arrow Shape": arrowHead,
        Width: 0,
        "WP.type": arrowHead
      }
    };
        cx2Data[5].edges.push(cx2Edge);
        edgeId +=1;
      });
    }

  const visualConfig = {
  visualEditorProperties: [
    {
      properties: {
        nodeSizeLocked: true,
        arrowColorMatchesEdge: true,
        nodeCustomGraphicsSizeSync: true,
        NETWORK_CENTER_Y_LOCATION: 0,
        NETWORK_CENTER_X_LOCATION: 0,
        NETWORK_SCALE_FACTOR: 1
      }
    }
  ],
  visualProperties: [
    {
      default: {
        edge: {
          EDGE_SOURCE_ARROW_SIZE: 6,
          EDGE_SOURCE_ARROW_SELECTED_PAINT: "#FFFF00",
          EDGE_LABEL_OPACITY: 1,
          EDGE_TARGET_ARROW_SELECTED_PAINT: "#FFFF00",
          EDGE_TARGET_ARROW_SHAPE: "none",
          EDGE_LABEL_BACKGROUND_OPACITY: 1,
          EDGE_LABEL_POSITION: {
            JUSTIFICATION: "center",
            MARGIN_X: 0,
            MARGIN_Y: 0,
            EDGE_ANCHOR: "C",
            LABEL_ANCHOR: "C"
          },
          EDGE_Z_ORDER: 0,
          EDGE_LABEL_MAX_WIDTH: 200,
          EDGE_LABEL_BACKGROUND_COLOR: "#B6B6B6",
          EDGE_LABEL_ROTATION: 0,
          EDGE_VISIBILITY: "element",
          EDGE_LABEL_FONT_SIZE: 10,
          EDGE_LABEL_COLOR: "#000000",
          EDGE_SELECTED_PAINT: "#FF0000",
          EDGE_SELECTED: "false"
        }
      }
    }

  ]
};
   if (!cx2Data.visualConfig) {
          cx2Data.visualConfig = [];
        }
        cx2Data[6].visualConfig.push(visualConfig);
    


       
    if (pathway.Label) {
      pathway.Label.forEach(label => {
        const graphics = label.Graphics[0].$;
        const cx2Label = {
          id: label.$.GraphId,
          text: label.$.TextLabel,
          graphics: {
            centerX: parseFloat(graphics.CenterX),
            centerY: parseFloat(graphics.CenterY),
            width: parseFloat(graphics.Width),
            height: parseFloat(graphics.Height),
            zOrder: parseInt(graphics.ZOrder, 10),
            fillColor: `#${graphics.FillColor}`,
            fontWeight: graphics.FontWeight,
            fontSize: parseInt(graphics.FontSize, 10),
            valign: graphics.Valign
          }
        };
        if (!cx2Data.labels) {
          cx2Data.labels = [];
        }
        cx2Data[7].labels.push(cx2Label);
      });
    }


  const edgeMapping = {
  "EDGE_TARGET_ARROW_SHAPE": {
    "type": "DISCRETE",
    "definition": {
      "map": [
        { "v": "Arrow", "vp": "triangle" },
        { "v": "mim-branching-right", "vp": "triangle-cross" },
        { "v": "mim-covalent-bond", "vp": "triangle-cross" },
        { "v": "mim-branching-left", "vp": "triangle-cross" },
        { "v": "mim-transcription-translation", "vp": "triangle" },
        { "v": "mim-binding", "vp": "triangle" },
        { "v": "Line", "vp": "none" },
        { "v": "mim-cleavage", "vp": "diamond" },
        { "v": "mim-gap", "vp": "triangle" },
        { "v": "mim-stimulation", "vp": "triangle" },
        { "v": "mim-catalysis", "vp": "circle" },
        { "v": "mim-inhibition", "vp": "tee" },
        { "v": "TBar", "vp": "tee" },
        { "v": "mim-modification", "vp": "triangle" },
        { "v": "mim-necessary-stimulation", "vp": "triangle-cross" },
        { "v": "mim-conversion", "vp": "triangle" }
      ],
      "attribute": "Target Arrow Shape",
      "type": "string"
    }
  }
};

 if (!cx2Data.edgeMapping) {
          cx2Data.edgeMapping = [];
        }
        cx2Data[8].edgeMapping.push(edgeMapping);






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
  });
});
