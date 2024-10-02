interface GradientEdgeProps {
  color1?: string;
  color2?: string;
}
export default function GradientEdge({
  color1 = "green",
  color2 = "pink",
}: GradientEdgeProps) {
  return (
    <svg viewBox="0 0 10 10" style={{ height: 0, width: 0 }}>
      <defs>
        <linearGradient id="edgegradient" gradientTransform="rotate(90)">
          <stop offset="5%" stopColor={color1} />
          <stop offset="95%" stopColor={color2} />
        </linearGradient>
      </defs>

      <circle cx="5" cy="5" r="4" fill="url('#myGradient')" />
    </svg>
  );
}
