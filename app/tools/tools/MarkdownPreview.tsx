"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { copyToClipboard } from "@/lib/toast";
import { Section } from "../shared";

function renderInlineMarkdown(text: string, keyPrefix: string) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${keyPrefix}-strong-${index}`}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={`${keyPrefix}-em-${index}`}>{part.slice(1, -1)}</em>;
    }

    return <span key={`${keyPrefix}-text-${index}`}>{part}</span>;
  });
}

function MDRender({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length === 0) return;
    blocks.push(
      <ul key={`list-${blocks.length}`} className="list-disc pl-5 space-y-1 mb-3">
        {listItems.map((item, index) => (
          <li key={`list-item-${index}`}>{renderInlineMarkdown(item, `list-${blocks.length}-${index}`)}</li>
        ))}
      </ul>,
    );
    listItems = [];
  };

  lines.forEach((line) => {
    if (line.startsWith("- ")) {
      listItems.push(line.slice(2));
      return;
    }

    flushList();

    if (!line.trim()) {
      blocks.push(<div key={`space-${blocks.length}`} className="h-3" />);
      return;
    }

    if (line.startsWith("### ")) {
      blocks.push(<h3 key={`h3-${blocks.length}`} className="text-lg font-semibold mb-2">{renderInlineMarkdown(line.slice(4), `h3-${blocks.length}`)}</h3>);
      return;
    }

    if (line.startsWith("## ")) {
      blocks.push(<h2 key={`h2-${blocks.length}`} className="text-xl font-semibold mb-2">{renderInlineMarkdown(line.slice(3), `h2-${blocks.length}`)}</h2>);
      return;
    }

    if (line.startsWith("# ")) {
      blocks.push(<h1 key={`h1-${blocks.length}`} className="text-2xl font-semibold mb-2">{renderInlineMarkdown(line.slice(2), `h1-${blocks.length}`)}</h1>);
      return;
    }

    blocks.push(<p key={`p-${blocks.length}`} className="mb-3">{renderInlineMarkdown(line, `p-${blocks.length}`)}</p>);
  });

  flushList();

  return <div>{blocks}</div>;
}

export function MarkdownPreview() {
  const starter =
    "# Release Notes\n\nThis is **live** preview with *italic* support.\n\n## Features\n- Real-time rendering\n- Copy-ready notes\n- Fast client-only parsing";
  const [text, setText] = useState(starter);
  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const headings = text.split("\n").filter((line) => line.startsWith("#")).length;
    return { words, headings };
  }, [text]);
  return (
    <Section id="markdown" title="Markdown Preview" desc="Lightweight headings, bold, italics, lists." accent="cyan" index={1}>
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-[family-name:var(--font-mono)]">
        <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-white/50">
          {stats.words} words
        </span>
        <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-white/50">
          {stats.headings} headings
        </span>
        <motion.button whileTap={{ scale: 0.95 }} className="tool-btn text-xs" onClick={() => setText(starter)}>
          Reset Sample
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }} className="tool-btn text-xs" onClick={() => copyToClipboard(text)}>
          Copy Markdown
        </motion.button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <textarea value={text} onChange={(e) => setText(e.target.value)} className="tool-input neon-input min-h-[200px] sm:min-h-[220px] resize-none" />
        <motion.div layout className="prose prose-invert max-w-none p-4 rounded-xl border border-white/[0.04] bg-black/20 min-h-[200px] overflow-auto text-sm">
          <MDRender text={text} />
        </motion.div>
      </div>
    </Section>
  );
}
