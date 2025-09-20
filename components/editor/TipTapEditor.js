// components/editor/TipTapEditor.jsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";

export default function TipTapEditor({ onChange }) {
  const editor = useEditor({
    extensions: [StarterKit, Image.configure({ inline: true })],
    content: "<p></p>",
    // 👇 IMPORTANT: disable SSR initial render
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null; // Avoid SSR mismatch

  return (
    <div className="border border-gray-300 rounded-lg p-3 min-h-[150px]">
      <EditorContent editor={editor} />
    </div>
  );
}