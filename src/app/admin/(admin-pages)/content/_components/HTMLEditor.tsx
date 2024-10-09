"use client";

import { useState, useEffect, useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";

import {
  ClassicEditor,
  AccessibilityHelp,
  AutoLink,
  Autosave,
  Bold,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  GeneralHtmlSupport,
  Heading,
  HtmlEmbed,
  Italic,
  Link,
  List,
  ListProperties,
  Paragraph,
  RemoveFormat,
  SelectAll,
  ShowBlocks,
  SpecialCharacters,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  Undo,
  type EditorConfig,
  SourceEditing,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";

import "./HTMLEditor.css";

interface HTMLEditorProps {
  initialData: string;
  onSave: (data: string) => Promise<void>;
}

export default function HTMLEditor({ initialData, onSave }: HTMLEditorProps) {
  const editorContainerRef = useRef(null);
  const editorRef = useRef(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  useEffect(() => {
    setIsLayoutReady(true);

    return () => setIsLayoutReady(false);
  }, []);

  const editorConfig: EditorConfig = {
    toolbar: {
      items: [
        "sourceEditing",
        "|",
        "undo",
        "redo",
        "|",
        "showBlocks",
        "selectAll",
        "|",
        "heading",
        "|",
        "fontColor",
        "fontBackgroundColor",
        "|",
        "bold",
        "italic",
        "removeFormat",
        "|",
        "link",
        "insertTable",
        "htmlEmbed",
        "|",
        "bulletedList",
        "numberedList",
      ],
      shouldNotGroupWhenFull: false,
    },
    plugins: [
      AccessibilityHelp,
      AutoLink,
      Autosave,
      Bold,
      Essentials,
      FontBackgroundColor,
      FontColor,
      FontFamily,
      FontSize,
      GeneralHtmlSupport,
      Heading,
      HtmlEmbed,
      Italic,
      Link,
      List,
      ListProperties,
      Paragraph,
      RemoveFormat,
      SelectAll,
      ShowBlocks,
      SpecialCharacters,
      Table,
      TableCaption,
      TableCellProperties,
      TableColumnResize,
      TableProperties,
      TableToolbar,
      Undo,
      SourceEditing,
    ],
    heading: {
      options: [
        {
          model: "paragraph",
          title: "Paragraph",
          class: "ck-heading_paragraph",
        },
        {
          model: "heading1",
          view: {
            name: "h1",
            classes: "text-cke-3xl",
          },
          title: "Heading 1",
          class: "ck-heading_heading1",
        },
        {
          model: "heading2",
          view: {
            name: "h2",
            classes: "text-cke-2xl",
          },
          title: "Heading 2",
          class: "ck-heading_heading2",
        },
        {
          model: "heading3",
          view: {
            name: "h3",
            classes: "text-cke-xl",
          },
          title: "Heading 3",
          class: "ck-heading_heading3",
        },
        {
          model: "heading4",
          view: {
            name: "h4",
            classes: "text-cke-lg",
          },
          title: "Heading 4",
          class: "ck-heading_heading4",
        },
      ],
    },
    htmlSupport: {
      allow: [
        {
          name: /^.*$/,
          styles: true,
          attributes: true,
          classes: true,
        },
      ],
    },
    initialData: initialData,
    link: {
      addTargetToExternalLinks: true,
      defaultProtocol: "https://",
      decorators: {
        toggleDownloadable: {
          mode: "manual",
          label: "Downloadable",
          attributes: {
            download: "file",
          },
        },
      },
    },
    list: {
      properties: {
        styles: true,
        startIndex: true,
        reversed: true,
      },
    },
    placeholder: "Type or paste your content here!",
    table: {
      contentToolbar: [
        "tableColumn",
        "tableRow",
        "mergeTableCells",
        "tableProperties",
        "tableCellProperties",
      ],
    },
    autosave: {
      save(editor) {
        return onSave(editor.getData());
      },
    },
  };

  return (
    <div>
      <div className="main-container">
        <div
          className="editor-container editor-container_classic-editor"
          ref={editorContainerRef}
        >
          <div className="editor-container__editor">
            <div ref={editorRef}>
              {isLayoutReady && (
                <CKEditor editor={ClassicEditor} config={editorConfig} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
