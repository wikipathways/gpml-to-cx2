export function  processState(pathway, params)
{
  let idCount = params.idCount;
  let cx2Data = params.cx2Data;
  let dataNodes = pathway.DataNode;


 if(pathway.State)
{    
    pathway.State.forEach(state => {
    // const state = pathway.State[1];
    let GraphRef = state.$.GraphRef;
    const stateGraphics = state.Graphics[0].$;
    const graphRef = state.$.GraphRef;

    const matchingDataNode = dataNodes.find(dataNode => dataNode.$.GraphId === graphRef);
      const graphics = matchingDataNode.Graphics[0].$;
      let x = parseFloat(graphics.CenterX);
      let y = parseFloat(graphics.CenterY);
      let z = parseFloat(graphics.ZOrder)+1;
      let width = parseFloat(graphics.Width);
      let height = parseFloat(graphics.Height);

  const commentString = state.Comment[0];
      const commentParts = commentString.split(';').reduce((acc, part) => {
        const [key, value] = part.split('=').map(str => str.trim());
        acc[key] = value;
        return acc;
      }, {});

      // Required properties
      const requiredProperties = [
        'parentid',
        'parentsymbol',
        'site',
        'position',
        'sitegrpid',
        'ptm',
        'direction'
      ];

      // Check if all required properties are present
      const hasAllRequiredProperties = requiredProperties.every(prop => prop in commentParts);

      if (!hasAllRequiredProperties) {
            const s = {
      id: idCount,   
      x: x + (parseFloat(stateGraphics.RelX) * width/2),
      y: y + (parseFloat(stateGraphics.RelY) * height/2),
      z: z,
      v: {
        name: state.$.TextLabel,
        }
       }
     cx2Data[4].nodes.push(s);
     idCount++;
     return;
      }
  
    const s = {
      id: idCount,   
      x: x + (parseFloat(stateGraphics.RelX) * width/2),
      y: y + (parseFloat(stateGraphics.RelY) * height/2),
      z: z,
      v: {
        parentsymbol: commentParts.parentsymbol,
        parentid: commentParts.parentid,
        direction: commentParts.direction,
        ptm: commentParts.ptm,
        site: commentParts.site,
        name: state.$.TextLabel,
        position: commentParts.position,
        sitegrpid: commentParts.sitegrpid
      }
    }
    cx2Data[4].nodes.push(s);
    idCount++;
  }) 
}
  params.idCount = idCount;
  params.cx2Data = cx2Data;
}