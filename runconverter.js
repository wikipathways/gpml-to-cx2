const fs = require('fs');
const parseString = require('xml2js').parseString;

const gpmlFilePath = process.argv[2];

if (!gpmlFilePath) {
  console.error('Usage: node runConverter.js <gpmlFilePath>');
  process.exit(1);
}

const cxDescriptor = {
  "CXVersion": "2.0",
  "hasFragments": false
};


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

    // Convert to CX2 format
    const cx2Data = {
      
      cxDescriptor: {
      "CXVersion": "2.0",
      "hasFragments": false
    },
    
    metaData: [
    { name: "attributeDeclarations", elementCount: 1 },
    { name: "networkAttributes", elementCount: 1 },
    { name: "edges", elementCount: 32 },
    { name: "nodes", elementCount: 50 },
    { name: "visualProperties", elementCount: 1 },
    { name: "visualEditorProperties", elementCount: 1 },
    { name: "edgeBypasses" },
    { name: "nodeBypasses" },
    { name: "tableVisualProperties" }
  ],

  attributeDeclarations: {
  "nodes": {
    "FillColor": { "d": "string" },
    "Shape": { "d": "string" },
    "BorderThickness": { "d": "double" },
    "BorderStyle": { "d": "string" },
    "GraphID": { "d": "string" },
    "Color": { "d": "string" },
    "ChEBI": { "d": "string" },
    "LabelSize": { "d": "double" },
    "IsGPMLShape": { "d": "boolean" },
    "XrefDatasource": { "d": "string" },
    "LabelFont": { "d": "string" },
    "Type": { "d": "string" },
    "Transparent": { "d": "string" },
    "XrefId": { "d": "string" },
    "name": { "d": "string" },
    "Height": { "d": "double" },
    "Ensembl": { "d": "string" },
    "Width": { "d": "double" },
    "selected": { "d": "boolean" }
  },
  "networkAttributes": {
    "shared name": { "d": "string" },
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
    "name": { "d": "string" },
    "interaction": { "d": "string" },
    "Interaction": { "d": "string" },
    "selected": { "d": "boolean" }
  }
},
  
    elements: {
        nodes: [],
        edges: [],
        labels: []
      },
       status: [ 
        {
          "success": true
        }
      ]
    };

        if (pathway.DataNode) {
      pathway.DataNode.forEach(dataNode => {
         const xref = dataNode.Xref && dataNode.Xref[0] ? dataNode.Xref[0].$ : null;
         const xrefId = xref ? xref.ID : null;
         const xrefDatasource = xref ? xref.Database : null;
        const cx2Node = {
          id: dataNode.$.GraphId, 
          x: parseFloat(dataNode.Graphics[0].$.CenterX), 
          y: parseFloat(dataNode.Graphics[0].$.CenterY), 
          z: parseInt(dataNode.Graphics[0].$.ZOrder) || 0, 
          v: {
            FillColor: dataNode.Graphics[0].$.FillColor || "#ffffff",
            Shape: dataNode.Graphics[0].$.Shape || "None",
            BorderThickness: parseFloat(dataNode.Graphics[0].$.BorderThickness) || 0,
            Color: dataNode.Graphics[0].$.Color || "#000000",
            ChEBI: xrefId,
            GraphId: dataNode.$.GraphId,
            "Border Width" : parseFloat(dataNode.Graphics[0].$.BorderThickness) || 0,
            LabelSize: parseInt(dataNode.Graphics[0].$.LabelSize),
            XrefDatasource: xrefDatasource,
            LabelFont: dataNode.Graphics[0].$.LabelFont  || "Dialog.plain",
            Type: dataNode.$.Type,
            Transparent: dataNode.Graphics[0].$.Transparent || "false",
            XrefId: xrefId,
            name: dataNode.$.TextLabel,
            Height: parseFloat(dataNode.Graphics[0].$.Height),
            Ensembl: dataNode.$.Ensembl || "",
            "Node Size": parseFloat(dataNode.Graphics[0].$.Width),
          
          }
        };
        cx2Data.elements.nodes.push(cx2Node);
      });
    }


    //  if (pathway.Interaction) {
    //   pathway.Interaction.forEach(interaction => {
    //     const points = interaction.Graphics[0].Point;
    //     const start = points[0];
    //     const end = points[1];
    //     const xref = interaction.Xref ? { database: interaction.Xref[0].$.Database, id: interaction.Xref[0].$.ID } : { database: '', id: '' };
    //     const cx2Edge = {
    //       id: interaction.$.GraphId,
    //       source: start.$.GraphRef,
    //       target: end.$.GraphRef,
    //       z: parseInt(interaction.Graphics[0].$.ZOrder),
    //       v: {
    //         lineThickness: parseFloat(interaction.Graphics[0].$.LineThickness),
    //         arrowHead: end.$.ArrowHead ? end.$.ArrowHead : 'None',
    //         startPoint: {
    //           x: parseFloat(start.$.X),
    //           y: parseFloat(start.$.Y),
    //           relX: parseFloat(start.$.RelX),
    //           relY: parseFloat(start.$.RelY)
    //         },
    //         endPoint: {
    //           x: parseFloat(end.$.X),
    //           y: parseFloat(end.$.Y),
    //           relX: parseFloat(end.$.RelX),
    //           relY: parseFloat(end.$.RelY),
    //           arrowHead: end.$.ArrowHead ? end.$.ArrowHead : 'None'
    //         },
    //         xref: xref
    //       }
    //     };
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
      id: interaction.$.GraphId,
      s: start.$.GraphRef,
      t: end.$.GraphRef,
      v: {
        LineStyle: "Solid",
        "Source Arrow Shape": shape,
        Color: "#000000",
        interaction: arrowHead,
        "Target Arrow Shape": arrowHead,
        Width: 1.0060088996034258,
        "WP.type": arrowHead
      }
    };
        cx2Data.elements.edges.push(cx2Edge);
      });
    }
       
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
        if (!cx2Data.elements.labels) {
          cx2Data.elements.labels = [];
        }
        cx2Data.elements.labels.push(cx2Label);
      });
    }

  const cx2DataArray = [cx2Data];


    // Convert CX2 data to JSON string
    const cx2JsonString = JSON.stringify(cx2DataArray, null, 2);

    // Write CX2 data to file
    const outputPath = `${gpmlFilePath}.cx2`;
    fs.writeFile(outputPath, cx2JsonString, 'utf-8', (err) => {
      if (err) {
        console.error(`Error writing CX2 file: ${err.message}`);
        process.exit(1);
      }
      console.log(`CX2 data successfully written to: ${outputPath}`);
    });
  });
});
