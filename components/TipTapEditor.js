"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

export default function TipTapEditor({
    content,
    onChange,
}) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [StarterKit],
        content: content || "",
        editorProps: {
            attributes: {
                class:
                    "min-h-[300px] rounded-2xl border border-white/10 bg-white/5 p-4 outline-none",
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content || "");
        }
    }, [content]);

    if (!editor) {
        return null;
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() =>
                        editor.chain().focus().toggleBold().run()
                    }
                    className="rounded-xl bg-white/10 px-4 py-2"
                >
                    Kalın
                </button>

                <button
                    type="button"
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                    className="rounded-xl bg-white/10 px-4 py-2"
                >
                    Başlık
                </button>

                <button
                    type="button"
                    onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                    className="rounded-xl bg-white/10 px-4 py-2"
                >
                    Liste
                </button>
            </div>

            <EditorContent editor={editor} />
        </div>
    );
}