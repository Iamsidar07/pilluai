interface GradientEdgeProps {
  color1?: string;
  color2?: string;
}
export default function GradientEdge({
  color1 = "red",
  color2 = "green",
}: GradientEdgeProps) {
  return (
    <svg viewBox="0 0 10 10" style={{ height: 0, width: 0 }}>
      <defs>
        <linearGradient id="edgegradient" gradientTransform="rotate(90)">
          <stop offset="35%" stopColor={color1} />
          <stop offset="65%" stopColor={color2} />
        </linearGradient>
      </defs>

      <circle cx="5" cy="5" r="4" fill="url('#myGradient')" />
    </svg>
  );
}
