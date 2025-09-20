// components/editor/TipTapEditor.jsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { useState, useCallback } from "react";

const lowlight = createLowlight(common);

// Toolbar component
const EditorToolbar = ({ editor }) => {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  // Hooks must always be called
  const addLink = useCallback(() => {
    if (editor && linkUrl) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
      setLinkUrl("");
      setShowLinkDialog(false);
    }
  }, [editor, linkUrl]);

  const addImage = useCallback(() => {
    if (editor && imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
      setShowImageDialog(false);
    }
  }, [editor, imageUrl]);

  if (!editor) return null;

  const toolbarGroups = [
    {
      name: "Format",
      buttons: [
        {
          name: "Bold",
          icon: "B",
          action: () => editor.chain().focus().toggleBold().run(),
          isActive: editor.isActive("bold"),
          className: "font-bold",
        },
        {
          name: "Italic",
          icon: "I",
          action: () => editor.chain().focus().toggleItalic().run(),
          isActive: editor.isActive("italic"),
          className: "italic",
        },
        {
          name: "Strike",
          icon: "S",
          action: () => editor.chain().focus().toggleStrike().run(),
          isActive: editor.isActive("strike"),
          className: "line-through",
        },
        {
          name: "Code",
          icon: "</>",
          action: () => editor.chain().focus().toggleCode().run(),
          isActive: editor.isActive("code"),
          className: "font-mono text-sm",
        },
      ],
    },
    {
      name: "Headings",
      buttons: [
        {
          name: "H1",
          icon: "H1",
          action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
          isActive: editor.isActive("heading", { level: 1 }),
          className: "font-bold text-lg",
        },
        {
          name: "H2",
          icon: "H2",
          action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          isActive: editor.isActive("heading", { level: 2 }),
          className: "font-bold",
        },
        {
          name: "H3",
          icon: "H3",
          action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
          isActive: editor.isActive("heading", { level: 3 }),
          className: "font-semibold",
        },
      ],
    },
    {
      name: "Lists",
      buttons: [
        {
          name: "Bullet List",
          icon: "•",
          action: () => editor.chain().focus().toggleBulletList().run(),
          isActive: editor.isActive("bulletList"),
        },
        {
          name: "Ordered List",
          icon: "1.",
          action: () => editor.chain().focus().toggleOrderedList().run(),
          isActive: editor.isActive("orderedList"),
        },
      ],
    },
    {
      name: "Blocks",
      buttons: [
        {
          name: "Quote",
          icon: '""',
          action: () => editor.chain().focus().toggleBlockquote().run(),
          isActive: editor.isActive("blockquote"),
        },
        {
          name: "Code Block",
          icon: "{}",
          action: () => editor.chain().focus().toggleCodeBlock().run(),
          isActive: editor.isActive("codeBlock"),
        },
        {
          name: "Horizontal Rule",
          icon: "—",
          action: () => editor.chain().focus().setHorizontalRule().run(),
          isActive: false,
        },
      ],
    },
    {
      name: "Media",
      buttons: [
        {
          name: "Link",
          icon: "🔗",
          action: () => setShowLinkDialog(true),
          isActive: editor.isActive("link"),
        },
        {
          name: "Image",
          icon: "🖼️",
          action: () => setShowImageDialog(true),
          isActive: false,
        },
        {
          name: "Highlight",
          icon: "🖍️",
          action: () => editor.chain().focus().toggleHighlight().run(),
          isActive: editor.isActive("highlight"),
        },
      ],
    },
  ];

  return (
    <div className="border-b border-gray-200 p-3 bg-gray-50 rounded-t-lg">
      <div className="flex flex-wrap items-center gap-1">
        {toolbarGroups.map((group, groupIndex) => (
          <div key={group.name} className="flex items-center">
            {group.buttons.map((button) => (
              <button
                key={button.name}
                onClick={button.action}
                title={button.name}
                className={`px-3 py-2 text-sm rounded-md transition-all duration-150 hover:bg-white hover:shadow-sm
                  ${button.isActive ? "bg-blue-100 text-blue-700 shadow-sm" : "text-gray-600 hover:text-gray-900"}
                  ${button.className || ""}`}
              >
                {button.icon}
              </button>
            ))}
            {groupIndex < toolbarGroups.length - 1 && (
              <div className="w-px h-6 bg-gray-300 mx-2"></div>
            )}
          </div>
        ))}

        {/* Undo/Redo */}
        <div className="w-px h-6 bg-gray-300 mx-2"></div>
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
          className="px-3 py-2 text-sm rounded-md text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
        >
          ↶
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
          className="px-3 py-2 text-sm rounded-md text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
        >
          ↷
        </button>
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="flex items-center gap-3">
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              autoFocus
            />
            <button
              onClick={addLink}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Add Link
            </button>
            <button
              onClick={() => setShowLinkDialog(false)}
              className="px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Image Dialog */}
      {showImageDialog && (
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="flex items-center gap-3">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              autoFocus
            />
            <button
              onClick={addImage}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Add Image
            </button>
            <button
              onClick={() => setShowImageDialog(false)}
              className="px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Status bar component
const EditorStatusBar = ({ editor }) => {
  if (!editor) return null;

  const wordCount = editor.state.doc.textContent
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  const charCount = editor.state.doc.textContent.length;

  return (
    <div className="border-t border-gray-200 p-2 bg-gray-50 rounded-b-lg">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span>Auto-saving</span>
        </div>
      </div>
    </div>
  );
};

// Main editor component
export default function TipTapEditor({
  onChange,
  initialContent = "",
  placeholder = "Start writing...",
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Image.configure({ inline: true, allowBase64: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800 transition-colors",
        },
      }),
      Highlight.configure({ multicolor: true }),
      CodeBlockLowlight.configure({ lowlight, defaultLanguage: "javascript" }),
    ],
    content: initialContent || "<p></p>",
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none max-w-none",
      },
    },
  });

  if (!editor)
    return (
      <div className="w-full border border-gray-300 rounded-lg">
        <div className="h-12 bg-gray-100 rounded-t-lg animate-pulse"></div>
        <div className="p-6 min-h-[300px] flex items-center justify-center">
          <div className="flex items-center gap-2 text-gray-500">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading editor...
          </div>
        </div>
        <div className="h-8 bg-gray-100 rounded-b-lg animate-pulse"></div>
      </div>
    );

  return (
    <div className="w-full">
      <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
        <EditorToolbar editor={editor} />
        <div className="relative">
          <EditorContent editor={editor} className="min-h-[300px] p-6 focus-within:bg-gray-50/30 transition-colors duration-200" />
          {editor.isEmpty && <div className="absolute top-6 left-6 text-gray-400 pointer-events-none text-lg">{placeholder}</div>}
        </div>
        <EditorStatusBar editor={editor} />
      </div>
    </div>
  );
}
