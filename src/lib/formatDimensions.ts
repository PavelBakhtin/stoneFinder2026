export function formatDimensions(
  length: number,
  width: number,
  thickness: number | null,
) {
  const dimensions = [length, width];

  if (thickness != null) {
    dimensions.push(thickness);
  }

  return `${dimensions.join(" × ")} мм`;
}