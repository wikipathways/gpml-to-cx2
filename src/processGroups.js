export function processGroups(pathway, params) {
  let idCount = params.idCount;
  let cx2Data = params.cx2Data;
  let graphIdMapping = params.graphIdMapping;

  if (pathway.Group) {
    pathway.Group.forEach(group => {
      let nodeInfo = getBounds(pathway, group.$.GroupId);
      if(nodeInfo.elementCount > 0) {
        const cx2Group = {
          id: idCount,
          x: parseFloat(nodeInfo.centerX),
          y: parseFloat(nodeInfo.centerY),
          z: 4096,
        };
  
        if (!cx2Data.nodes) {
          cx2Data.nodes = [];
        }
  
        cx2Data[4].nodes.push(cx2Group);
        graphIdMapping[group.$.GraphId] = idCount;
  
        let style = group.$.Style || "None";
        let borderWidth = 0;
        if(style != "Group")
          borderWidth = 1;
        let borderStyle = "dashed";
        if(style == "Complex")
          borderStyle = "solid";
        let backgroundColor = "#FFFFFF";
        if(style == "Pathway")
          backgroundColor = "#00FF00";
        else if(style == "Complex" || style == "None")
          backgroundColor = "#B4B464";
        let shape = "rectangle";
        if(style == "Complex")
          shape = "octagon";
  
        const v = {
          "NODE_BORDER_WIDTH": borderWidth,
          "NODE_LABEL_COLOR": "#AAAAAA",
          "NODE_Z_LOCATION": 4096,
          "NODE_BORDER_COLOR": "#AAAAAA",
          "NODE_HEIGHT": nodeInfo.height,
          "NODE_BORDER_STYLE": borderStyle,
          "NODE_BACKGROUND_COLOR": backgroundColor,
          "NODE_SHAPE": shape,
          "NODE_SELECTED_PAINT": "#FFFFCC",
          "NODE_BACKGROUND_OPACITY": 0.09803921568627451,
          "NODE_WIDTH": nodeInfo.width
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
      }
    });
  }

  params.idCount = idCount;
  params.cx2Data = cx2Data;
  params.graphIdMapping = graphIdMapping;
}

function getGroupElements (pathway, groupId) {
  let groupElements = new Set();
  if (pathway.DataNode) {
    pathway.DataNode.forEach(dataNode => {
      let groupRef = dataNode.$.GroupRef;
      if(groupRef && groupRef == groupId)
        groupElements.add(dataNode);
    });
  }
  if (pathway.Label) {
    pathway.Label.forEach(label => {
      let groupRef = label.$.GroupRef;
      if(groupRef && groupRef == groupId)
        groupElements.add(label);
    });
  }
  if (pathway.Shape) {
    pathway.Shape.forEach(shape => {
      let groupRef = shape.$.GroupRef;
      if(groupRef && groupRef == groupId)
        groupElements.add(shape);
    });
  }
  return groupElements;
}

function getBounds(pathway, groupId) {
  let groupElements = getGroupElements(pathway, groupId);

  let left = Number.MAX_VALUE;
  let right = -Number.MAX_VALUE;
  let top = Number.MAX_VALUE;
  let bottom = -Number.MAX_VALUE;
  let nodeLeft;
  let nodeRight;
  let nodeTop;
  let nodeBottom;
  const margin = 8;
  groupElements.forEach(groupElement => {
    const graphics = groupElement.Graphics[0].$;
    nodeLeft = parseFloat(graphics.CenterX) - parseFloat(graphics.Width) / 2;
    nodeRight = parseFloat(graphics.CenterX) + parseFloat(graphics.Width) / 2;
    nodeTop = parseFloat(graphics.CenterY) - parseFloat(graphics.Height) / 2;
    nodeBottom = parseFloat(graphics.CenterY) + parseFloat(graphics.Height) / 2;

    if (left > nodeLeft) {
      left = nodeLeft;
    }
    if (right < nodeRight) {
      right = nodeRight;
    }
    if (top > nodeTop) {
      top = nodeTop;
    }
    if (bottom < nodeBottom) {
      bottom = nodeBottom;
    }
  });

  let centerX = (right + left) / 2;
  let centerY = (top + bottom) / 2;
  let width = (right - left) + 2 * margin;
  let height = (bottom - top) + 2 * margin;

  return {centerX: centerX, centerY: centerY, width: width, height: height, elementCount: groupElements.size};
}