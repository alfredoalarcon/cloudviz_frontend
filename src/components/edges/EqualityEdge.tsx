import React from "react";
import { BaseEdge, EdgeProps, getBezierPath } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Custom Edge defined with your requested pattern
const EqualityEdge = React.memo(function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{ stroke: "#a29f9fff", strokeWidth: 0.9 }}
      />
      {/* <text>
        <textPath
          href={`#${id}`}
          startOffset="50%"
          textAnchor="middle"
          style={{ fontSize: 12, fill: "#E53E3E" }}
        >
          Custom Edge
        </textPath>
      </text> */}
    </>
  );
});

export default EqualityEdge;
