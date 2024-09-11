export function processStates(pathway, params) {
  let idCount = params.idCount;
  let cx2Data = params.cx2Data;
  let dataNodes = pathway.DataNode;

  if (pathway.State) {
    pathway.State.forEach((state) => {
      let GraphRef = state.$.GraphRef;
      const stateGraphics = state.Graphics[0].$;
      const graphRef = state.$.GraphRef;

      const matchingDataNode = dataNodes.find(
        (dataNode) => dataNode.$.GraphId === graphRef
      );
      const graphics = matchingDataNode.Graphics[0].$;
      let x = parseFloat(graphics.CenterX);
      let y = parseFloat(graphics.CenterY);
      let z = parseFloat(graphics.ZOrder) + 1;
      let width = parseFloat(graphics.Width);
      let height = parseFloat(graphics.Height);

      const commentString = state.Comment[0];
      const commentParts = commentString.split(";").reduce((acc, part) => {
        const [key, value] = part.split("=").map((str) => str.trim());
        acc[key] = value;
        return acc;
      }, {});

      // Required properties
      const requiredProperties = [
        "parentid",
        "parentsymbol",
        "site",
        "position",
        "sitegrpid",
        "ptm",
        "direction",
      ];

      // Check if all required properties are present
      const hasAllRequiredProperties = requiredProperties.every(
        (prop) => prop in commentParts
      );

      const s = {
        id: idCount,
        x: x + (parseFloat(stateGraphics.RelX) * width) / 2,
        y: y + (parseFloat(stateGraphics.RelY) * height) / 2,
        z: z,
        v: hasAllRequiredProperties
          ? {
              parentsymbol: commentParts.parentsymbol,
              parentid: commentParts.parentid,
              direction: commentParts.direction,
              ptm: commentParts.ptm,
              site: commentParts.site,
              name: state.$.TextLabel,
              position: commentParts.position,
              sitegrpid: commentParts.sitegrpid,
            }
          : {
              name: state.$.TextLabel,
            },
      };
      cx2Data[4].nodes.push(s);

      const v = {
        NODE_BORDER_WIDTH: 1,
        NODE_LABEL: state.$.TextLabel,
        NODE_Z_LOCATION: z,
        NODE_LABEL_COLOR: stateGraphics.Color
          ? "#" + stateGraphics.Color
          : "#000000",
        NODE_BORDER_COLOR: stateGraphics.Color
          ? "#" + stateGraphics.Color
          : "#000000",
        NODE_HEIGHT: parseFloat(stateGraphics.Height),
        NODE_BACKGROUND_COLOR: "#FFFFFF",
        NODE_SHAPE: stateGraphics.ShapeType
          ? stateGraphics.ShapeType
          : "Rectangle",
        NODE_LABEL_FONT_FACE: {
          FONT_FAMILY: stateGraphics.FontFamily || "sans-serif",
          FONT_STYLE: stateGraphics.FontStyle || "normal",
          FONT_WEIGHT: stateGraphics.FontWeight || "normal",
          FONT_NAME: stateGraphics.FontName || "Dialog.plain",
        },
        NODE_LABEL_FONT_SIZE: stateGraphics.FontSize
          ? stateGraphics.FontSize
          : 10,
        NODE_BACKGROUND_OPACITY: 1,
        NODE_WIDTH: parseFloat(stateGraphics.Width),
      };

      const nodebypass = {
        id: idCount,
        v: v,
      };

      cx2Data[9].nodeBypasses.push(nodebypass);

      idCount++;
    });
  }
  params.idCount = idCount;
  params.cx2Data = cx2Data;
}
