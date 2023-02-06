import { highlight, languages } from "prismjs";
import React from "react";
import DiffViewer, { DiffMethod } from "react-diff-viewer-continued";

// @ts-expect-error Somehow the component can only be accessed from .default
const ReactDiffViewer = DiffViewer.default;

interface DiffViewProps {
  oldCode: string;
  newCode: string;
}

export const DiffView: React.FC<DiffViewProps> = ({ oldCode, newCode }) => {
  return (
    <ReactDiffViewer
      oldValue={oldCode}
      newValue={newCode}
      splitView
      showDiffOnly
      extraLinesSurroundingDiff={3}
      compareMethod={DiffMethod.WORDS}
      renderContent={(str: string | undefined) => {
        return (
          <pre
            style={{ display: "inline" }}
            dangerouslySetInnerHTML={{
              __html: highlight(str ?? "", languages.javascript, "javascript"),
            }}
          />
        );
      }}
      styles={{
        variables: {
          light: {
            fontFamily: "var(--vscode-editor-font-family)",
            fontSize: "var(--vscode-editor-font-size)",

            // Documented properties: https://github.com/praneshr/react-diff-viewer/tree/v3.0.0#overriding-styles
            diffViewerBackground: "var(--vscode-editor-background)",
            diffViewerColor: "var(--vscode-editor-foreground)",
            addedBackground: "var(--vscode-diffEditor-insertedLineBackground)",
            addedColor: "var(--vscode-gitDecoration-addedResourceForeground)",
            removedBackground: "var(--vscode-diffEditor-removedLineBackground)",
            removedColor:
              "var(--vscode-gitDecoration-deletedResourceForeground)",
            wordAddedBackground:
              "var(--vscode-diffEditor-insertedLineBackground)",
            wordRemovedBackground:
              "var(--vscode-diffEditor-removedLineBackground)",
            addedGutterBackground:
              "var(--vscode-gitlens-gutterBackgroundColor)",
            removedGutterBackground:
              "var(--vscode-gitlens-gutterBackgroundColor)",
            gutterBackground: "var(--vscode-gitlens-gutterBackgroundColor)",
            gutterBackgroundDark: "var(--vscode-gitlens-gutterBackgroundColor)",
            highlightBackground:
              "var(--vscode-gitlens-lineHighlightBackgroundColor)",
            highlightGutterBackground:
              "var(--vscode-gitlens-lineHighlightOverviewRulerColor)",
            codeFoldGutterBackground:
              "var(--vscode-gitlens-gutterBackgroundColor)",
            codeFoldBackground: "var(--vscode-diffEditor-diagonalFill)",
            emptyLineBackground: "var(--vscode-editor-background)",
            gutterColor: "var(--vscode-editorGutter-foldingControlForeground)",
            addedGutterColor: "var(--vscode-editorGutter-addedBackground)",
            removedGutterColor: "var(--vscode-editorGutter-deletedBackground)",
            codeFoldContentColor:
              "var(--vscode-editorGutter-foldingControlForeground)",
            diffViewerTitleBackground: "var(--vscode-editor-background)",
            diffViewerTitleColor: "var(--vscode-editor-foreground)",
            diffViewerTitleBorderColor:
              "var(--vscode-sideBySideEditor-horizontalBorder)",
          },
        },
        codeFoldGutter: {
          opacity: 0.6,
        },
      }}
    />
  );
};
