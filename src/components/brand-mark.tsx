"use client";
import { useId } from "react";
/** Display the original logo as an alpha mask, discarding its paper background. */
export function BrandMark() {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg
      className="brand-mark"
      viewBox="0 0 764 768"
      role="img"
      aria-label="Asel Cosmetics"
    >
      <defs>
        <filter id={`ink-${id}`} colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 -1 0 1"
          />
          <feComponentTransfer>
            <feFuncA type="linear" slope="4" intercept="-0.5" />
          </feComponentTransfer>
        </filter>
        <mask
          id={`logo-${id}`}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="764"
          height="768"
          style={{ maskType: "alpha" }}
        >
          <image
            href="/images/asel-logo.jpeg"
            width="764"
            height="768"
            filter={`url(#ink-${id})`}
          />
        </mask>
      </defs>
      <rect
        width="764"
        height="768"
        fill="currentColor"
        mask={`url(#logo-${id})`}
      />
    </svg>
  );
}
