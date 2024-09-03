export function processShapes(pathway, params) {
  let idCount = params.idCount;
  let cx2Data = params.cx2Data;

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
  params.idCount = idCount;
  params.cx2Data = cx2Data;
};