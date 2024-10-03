export function processGraphicalLines(pathway, params, dataNodeCount) {
  let idCount = params.idCount;
  let cx2Data = params.cx2Data;
  let graphIdMapping = params.graphIdMapping;

  if (pathway.GraphicalLine) {
    pathway.GraphicalLine.forEach((graphicalLine) => {
      const graphics = graphicalLine.Graphics[0];
      const points = graphics.Point;

      points.forEach((point) => {
        if (!point.$.GraphId) {
          point.$.GraphId = `generated-${idCount}`;
        }

        let v;
        v = {
          NODE_CUSTOMGRAPHICS_SIZE_7: 1,
          NODE_CUSTOMGRAPHICS_SIZE_6: 1,
          NODE_CUSTOMGRAPHICS_SIZE_5: 1,
          NODE_CUSTOMGRAPHICS_SIZE_4: 1,
          NODE_CUSTOMGRAPHICS_SIZE_3: 1,
          NODE_CUSTOMGRAPHICS_SIZE_2: 1,
          NODE_CUSTOMGRAPHICS_SIZE_1: 1,
          NODE_HEIGHT: 1,
          NODE_SHAPE: "rectangle",
          NODE_WIDTH: 1,
          NODE_CUSTOMGRAPHICS_SIZE_9: 1,
          NODE_CUSTOMGRAPHICS_SIZE_8: 1,
        };
        const nodebypass = {
          id: idCount,
          v: v,
        };
        cx2Data[9].nodeBypasses.push(nodebypass);

        const node = {
          id: idCount,
          x: parseFloat(point.$.X),
          y: parseFloat(point.$.Y),
          z: graphics.$.ZOrder,
        };
        dataNodeCount++;
        cx2Data[4].nodes.push(node);
        graphIdMapping[point.$.GraphId] = idCount;
        idCount += 1;

        for (let i = 0; i < points.length - 1; i++) {
          const startGraphId = points[i].$.GraphId;
          const endGraphId = points[i + 1].$.GraphId;

          if (
            graphIdMapping[startGraphId] !== undefined &&
            graphIdMapping[endGraphId] !== undefined
          ) {
            const cx2Edge = {
              id: idCount,
              s: graphIdMapping[startGraphId],
              t: graphIdMapping[endGraphId],

              v: {
                StartArrow: "Line",
                EndArrow: point.$.ArrowHead ? point.$.ArrowHead : "Line",
                ConnectorType: "Straight",
                LineThickness: parseFloat(graphics.$.LineThickness),
                LineStyle: graphics.$.LineStyle
                  ? graphics.$.LineStyle
                  : "Solid",
                Color: graphics.$.Color ? graphics.$.Color : "#000000",
                interaction: point.$.ArrowHead ? point.$.ArrowHead : "Line",
              },
            };
            idCount += 1;
            cx2Data[5].edges.push(cx2Edge);
          }
        }
      });
    });
  }
  params.idCount = idCount;
  params.cx2Data = cx2Data;
  params.graphIdMapping = graphIdMapping;
};
