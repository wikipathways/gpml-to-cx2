export function getBorderThickness(shape, lineThickness) {
  if (shape === "None") {
    return 0;
  }
  return lineThickness;
};

export function constructLabelFont(fontName, fontWeight, fontStyle) {
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