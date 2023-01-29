import React from "react";

export const SquigglySeparator: React.FC = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "10px",
        overflow: "hidden",
        position: "relative",
        marginTop: "10px",
        marginBottom: "10px",
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(45deg, transparent, transparent 49%, var(--vscode-foreground) 49%, transparent 51%)",
          position: "absolute",
          height: "10px",
          width: "200%",
          transform: "translate(-25%) scale(0.5)",
          backgroundSize: "20px 20px",
        }}
      />
      <div
        style={{
          background:
            "linear-gradient(-45deg, transparent, transparent 49%, var(--vscode-foreground) 49%, transparent 51%)",
          position: "absolute",
          height: "10px",
          width: "200%",
          transform: "translate(-25%) scale(0.5)",
          backgroundSize: "20px 20px",
        }}
      />
    </div>
  );
};
