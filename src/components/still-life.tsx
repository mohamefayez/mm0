// Original code-native decorative artwork. These bottles are not products for sale.
export function StillLife({
  small = false,
  tone = "amber",
}: {
  small?: boolean;
  tone?: string;
}) {
  return (
    <div
      className={`still-life ${small ? "small" : ""} tone-${tone}`}
      aria-hidden="true"
    >
      <div className="light-arch" />
      <div className="still-shadow" />
      <div className="stone stone-back" />
      <div className="stone stone-front" />
      <svg className="botanical" viewBox="0 0 280 500" fill="none">
        <path
          d="M60 490C160 390 92 300 170 200C208 145 200 78 220 12"
          stroke="currentColor"
          strokeWidth="3"
        />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i} transform={`translate(${i * 12} ${-i * 73})`}>
            <path
              d="M118 399C30 398 28 347 47 305C89 310 119 350 118 399Z"
              fill="currentColor"
            />
            <path
              d="M119 397C183 409 232 375 236 331C184 318 133 343 119 397Z"
              fill="currentColor"
            />
          </g>
        ))}
      </svg>
      <div className="perfume-bottle bottle-main">
        <div className="bottle-cap" />
        <div className="bottle-neck" />
        <div className="bottle-glass">
          <div className="bottle-liquid" />
          <div className="bottle-label">
            <span>Asel</span>
            <small>THE ART OF SCENT</small>
            <i>eau de parfum</i>
          </div>
        </div>
      </div>
      {!small && (
        <div className="perfume-bottle bottle-side">
          <div className="bottle-cap" />
          <div className="bottle-neck" />
          <div className="bottle-glass">
            <div className="bottle-liquid" />
            <div className="bottle-label">
              <span>Asel</span>
              <small>ESSENCE</small>
            </div>
          </div>
        </div>
      )}
      <div className="art-caption">An Asel fragrance study</div>
    </div>
  );
}
