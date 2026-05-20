"use client";

import { useEffect, useState } from "react";

const editorConfig = {
  licenseKey: "GPL",
  toolbar: [
    "undo",
    "redo",
    "|",
    "heading",
    "|",
    "fontFamily",
    "fontSize",
    "fontColor",
    "fontBackgroundColor",
    "|",
    "bold",
    "italic",
    "underline",
    "strikethrough",
    "removeFormat",
    "|",
    "link",
    "insertImageViaUrl",
    "insertTable",
    "mediaEmbed",
    "blockQuote",
    "codeBlock",
    "horizontalLine",
    "specialCharacters",
    "|",
    "bulletedList",
    "numberedList",
    "outdent",
    "indent",
    "|",
    "alignment",
    "highlight",
    "|",
    "sourceEditing",
  ],
  image: {
    toolbar: [
      "imageTextAlternative",
      "|",
      "imageStyle:inline",
      "imageStyle:wrapText",
      "imageStyle:breakText",
      "|",
      "resizeImage",
    ],
  },
  table: {
    contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
  },
  link: {
    addTargetToExternalLinks: true,
    defaultProtocol: "https://",
  },
  mediaEmbed: {
    previewsInData: true,
  },
  htmlSupport: {
    allow: [
      {
        name: /.*/,
        attributes: true,
        classes: true,
        styles: true,
      },
    ],
  },
};

export function CkeditorField({ value, onChange, disabled = false }) {
  const [editorModules, setEditorModules] = useState(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadEditor() {
      try {
        const [{ CKEditor }, ckeditor5] = await Promise.all([
          import("@ckeditor/ckeditor5-react"),
          import("ckeditor5"),
        ]);

        if (!active) {
          return;
        }

        const {
          Alignment,
          Autoformat,
          BlockQuote,
          Bold,
          ClassicEditor,
          CodeBlock,
          Essentials,
          FontBackgroundColor,
          FontColor,
          FontFamily,
          FontSize,
          GeneralHtmlSupport,
          Heading,
          Highlight,
          HorizontalLine,
          Image,
          ImageCaption,
          ImageInsertViaUrl,
          ImageResize,
          ImageStyle,
          ImageToolbar,
          Indent,
          Italic,
          Link,
          List,
          MediaEmbed,
          Paragraph,
          PasteFromOffice,
          RemoveFormat,
          SourceEditing,
          SpecialCharacters,
          SpecialCharactersEssentials,
          Strikethrough,
          Table,
          TableToolbar,
          Underline,
          Undo,
        } = ckeditor5;

        setEditorModules({
          CKEditor,
          ClassicEditor,
          config: {
            ...editorConfig,
            plugins: [
              Alignment,
              Autoformat,
              BlockQuote,
              Bold,
              CodeBlock,
              Essentials,
              FontBackgroundColor,
              FontColor,
              FontFamily,
              FontSize,
              GeneralHtmlSupport,
              Heading,
              Highlight,
              HorizontalLine,
              Image,
              ImageCaption,
              ImageInsertViaUrl,
              ImageResize,
              ImageStyle,
              ImageToolbar,
              Indent,
              Italic,
              Link,
              List,
              MediaEmbed,
              Paragraph,
              PasteFromOffice,
              RemoveFormat,
              SourceEditing,
              SpecialCharacters,
              SpecialCharactersEssentials,
              Strikethrough,
              Table,
              TableToolbar,
              Underline,
              Undo,
            ],
          },
        });
        setError("");
      } catch {
        if (active) {
          setError("Editor could not be initialized");
        }
      }
    }

    loadEditor();

    return () => {
      active = false;
    };
  }, []);

  const CKEditorComponent = editorModules?.CKEditor;

  return (
    <div className="space-y-3">
      <div className="ckeditor5-shell rounded-[1.75rem] border border-border bg-white p-3 shadow-sm dark:bg-slate-900/70">
        {CKEditorComponent && editorModules ? (
          <CKEditorComponent
            editor={editorModules.ClassicEditor}
            disabled={disabled}
            config={editorModules.config}
            data={value || ""}
            onReady={() => {
              setReady(true);
              setError("");
            }}
            onChange={(_event, editor) => {
              onChange(editor.getData());
            }}
            onError={(_loadError, details) => {
              if (!details?.willEditorRestart) {
                setError("Editor could not be initialized");
              }
            }}
          />
        ) : null}
      </div>
      {!ready && !error ? <p className="text-sm text-slate-500">Loading editor...</p> : null}
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
    </div>
  );
}
