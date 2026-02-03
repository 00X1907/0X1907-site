import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-css";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-go";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export const CodeBlock = ({ code, language = "typescript", filename }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayLang = language === "tsx" ? "TypeScript (React)" : 
                      language === "jsx" ? "JavaScript (React)" :
                      language.charAt(0).toUpperCase() + language.slice(1);

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span>{filename || displayLang}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre>
        <code ref={codeRef} className={`language-${language}`}>
          {code}
        </code>
      </pre>
    </div>
  );
};
