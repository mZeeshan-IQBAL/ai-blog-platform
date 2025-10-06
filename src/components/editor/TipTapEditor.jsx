// src/components/editor/TipTapEditor.jsx
"use client";

import { useEditor } from "@tiptap/react";
import dynamic from "next/dynamic";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Placeholder from "@tiptap/extension-placeholder";
import { common, createLowlight } from "lowlight";
import {
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";

const EditorContent = dynamic(
  () => import("@tiptap/react").then((mod) => mod.EditorContent),
  { ssr: false }
);

const lowlight = createLowlight(common);

// Toolbar
const EditorToolbar = ({ editor }) => {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

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

  return (
    <div className="border-b p-2 bg-gray-50 flex flex-wrap items-center gap-1">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive("bold") ? "font-bold text-primary" : ""}>B</button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive("italic") ? "italic text-primary" : ""}>I</button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive("strike") ? "line-through text-primary" : ""}>S</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive("heading", { level: 1 }) ? "text-primary font-bold" : ""}>H1</button>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive("bulletList") ? "text-primary" : ""}>•</button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive("orderedList") ? "text-primary" : ""}>1.</button>
      <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive("blockquote") ? "text-primary" : ""}>"</button>
      <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive("codeBlock") ? "text-primary" : ""}>{`{}`}</button>
      <button onClick={() => setShowLinkDialog(true)}>🔗</button>
      <button onClick={() => setShowImageDialog(true)}>🖼️</button>
      <button onClick={() => editor.chain().focus().toggleHighlight().run()} className={editor.isActive("highlight") ? "bg-yellow-200" : ""}>🖍️</button>

      {/* Link dialog */}
      {showLinkDialog && (
        <div className="flex gap-2 ml-2">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            className="border px-2 py-1 text-sm"
          />
          <button onClick={addLink} className="px-2 bg-primary text-primary-foreground text-sm">Add</button>
          <button onClick={() => setShowLinkDialog(false)} className="px-2 text-sm">✕</button>
        </div>
      )}

      {/* Image dialog */}
      {showImageDialog && (
        <div className="flex gap-2 ml-2">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="border px-2 py-1 text-sm"
          />
          <button onClick={addImage} className="px-2 bg-primary text-primary-foreground text-sm">Add</button>
          <button onClick={() => setShowImageDialog(false)} className="px-2 text-sm">✕</button>
        </div>
      )}
    </div>
  );
};

// Main Editor
const TipTapEditor = forwardRef(function TipTapEditor(
  { onChange, initialContent = "", placeholder = "Start writing..." },
  ref
) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false, link: false }),
      Image,
      Link,
      Highlight,
      CodeBlockLowlight.configure({ lowlight }),
      Placeholder.configure({ placeholder }),
    ],
    content: initialContent || "<p></p>",
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "p-3 min-h-[200px] border rounded focus:outline-none",
      },
    },
    immediatelyRender: false, // ✅ fixes SSR mismatch
  });

  useImperativeHandle(ref, () => ({
    insertHTML: (html) => editor?.chain().focus().insertContent(html).run(),
    setContent: (html) => editor?.commands.setContent(html),
    clear: () => editor?.commands.clearContent(),
    getHTML: () => editor?.getHTML() || "",
  }));

  if (!mounted || !editor) {
    return <div className="p-4 border rounded">Loading editor...</div>;
  }

  return (
    <div className="border rounded">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
});

export default TipTapEditor;
