export function processInteractions(pathway, params) {
  let idCount = params.idCount;
  let cx2Data = params.cx2Data;
  let graphIdMapping = params.graphIdMapping;
  let cx2EdgeIdCounts = params.cx2EdgeIdCounts;

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
            ConnectorType: interaction.Graphics[0].$.ConnectorType ? interaction.Graphics[0].$.ConnectorType : "Straight",
            LineThickness: parseFloat(interaction.Graphics[0].$.LineThickness),
            LineStyle: lineStyle,
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
  params.idCount = idCount;
  params.cx2Data = cx2Data;
  params.graphIdMapping = graphIdMapping;
  params.cx2EdgeIdCounts = cx2EdgeIdCounts;
};