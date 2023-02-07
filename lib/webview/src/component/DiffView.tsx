import { highlight, languages } from "prismjs";
import React from "react";
import DiffViewer, { DiffMethod } from "react-diff-viewer-continued";

// @ts-expect-error Somehow the component can only be accessed from .default
const ReactDiffViewer = DiffViewer.default;

interface DiffViewProps {
  oldCode: string;
  newCode: string;
  languageId?: string;
}

export const DiffView: React.FC<DiffViewProps> = ({
  oldCode,
  newCode,
  languageId,
}) => {
  const { grammar, language } = toPrismHighlightOptions(languageId);
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
              __html: highlight(str ?? "", grammar, language),
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

type PrismHighlightOptions = {
  grammar: Prism.Grammar;
  language: string;
};

const DEFAULT_PRISM_OPTIONS: PrismHighlightOptions = {
  grammar: languages.text,
  language: "text",
};

function toPrismHighlightOptions(
  languageId: string | undefined
): PrismHighlightOptions {
  if (!languageId) {
    return DEFAULT_PRISM_OPTIONS;
  }

  /**
   * VS Code known language IDs:
   * https://code.visualstudio.com/docs/languages/identifiers#_known-language-identifiers
   */

  /**
   * Prism supports the following languages by default:
   * - plain, plaintext, text, txt
   * - html, markup
   * - svg
   * - xml
   * - ssml, atom, rss
   * - css
   * - javascript, js
   *
   * If we want more, we need to load the relevant scripts:
   * https://cdnjs.com/libraries/prism/1.29.0
   */

  switch (languageId) {
    case "javascript":
    case "javascriptreact":
    case "typescript":
    case "typescriptreact":
    case "vue":
    case "svelte":
    case "coffeescript":
      return {
        grammar: languages.javascript,
        language: "javascript",
      };

    case "html":
    case "vue-html":
      return {
        grammar: languages.html,
        language: "html",
      };

    case "xml":
      return {
        grammar: languages.xml,
        language: "xml",
      };

    case "css":
    case "scss":
      return {
        grammar: languages.css,
        language: "css",
      };

    case "plaintext":
    case "diff":
      return DEFAULT_PRISM_OPTIONS;

    default:
      console.warn(
        `Can't find Prism grammar for language ${languageId}, use default one`
      );
      return DEFAULT_PRISM_OPTIONS;
  }
}
