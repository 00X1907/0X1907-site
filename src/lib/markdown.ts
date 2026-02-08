import type { BlogPost, ContentBlock, PostMetadata } from "@/data/blogPosts";

interface FrontMatter {
  id: string;
  title: string;
  category: string;
  date?: string;
  tags?: string;
}

/**
 * Parse frontmatter from markdown content
 */
function parseFrontMatter(content: string): { frontMatter: FrontMatter; body: string } {
  const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontMatterRegex);

  if (!match) {
    throw new Error("Invalid markdown: missing frontmatter");
  }

  const frontMatterLines = match[1].split("\n");
  const frontMatter: Record<string, string> = {};

  for (const line of frontMatterLines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      frontMatter[key] = value;
    }
  }

  return {
    frontMatter: frontMatter as unknown as FrontMatter,
    body: match[2].trim(),
  };
}

/**
 * Parse markdown body into content blocks
 */
function parseMarkdownToBlocks(markdown: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const lines = markdown.split("\n");

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Code block
    if (line.startsWith("```")) {
      const language = line.slice(3).trim() || "text";
      const codeLines: string[] = [];
      let filename: string | undefined;

      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        const codeLine = lines[i];
        // Check for filename comment
        if (codeLines.length === 0 && codeLine.match(/^(#|\/\/)\s*filename:\s*/)) {
          filename = codeLine.replace(/^(#|\/\/)\s*filename:\s*/, "").trim();
        } else {
          codeLines.push(codeLine);
        }
        i++;
      }
      i++; // Skip closing ```

      blocks.push({
        type: "code",
        language,
        filename,
        content: codeLines.join("\n"),
      });
      continue;
    }

    // Heading
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length as 1 | 2 | 3;
      blocks.push({
        type: "heading",
        level,
        content: headingMatch[2],
      });
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      blocks.push({
        type: "blockquote",
        content: quoteLines.join(" "),
      });
      continue;
    }

    // Ordered list
    if (line.match(/^\d+\.\s/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      blocks.push({
        type: "ordered-list",
        items,
      });
      continue;
    }

    // Unordered list
    if (line.match(/^[-*]\s/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*]\s/)) {
        items.push(lines[i].replace(/^[-*]\s/, ""));
        i++;
      }
      blocks.push({
        type: "list",
        items,
      });
      continue;
    }

    // Horizontal rule
    if (line.match(/^---+$/) || line.match(/^\*\*\*+$/)) {
      blocks.push({ type: "divider" });
      i++;
      continue;
    }

    // Table (starts with |)
    if (line.startsWith("|") && line.endsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|") && lines[i].endsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }

      // Helper to split table row handling escaped pipes
      const splitTableRow = (row: string): string[] => {
        // Replace escaped pipes with placeholder, split, then restore
        const placeholder = "\x00PIPE\x00";
        return row
          .slice(1, -1)
          .replace(/\\\|/g, placeholder)
          .split("|")
          .map((cell) => cell.trim().replace(new RegExp(placeholder, "g"), "|"));
      };

      if (tableLines.length >= 2) {
        // Parse header row
        const headers = splitTableRow(tableLines[0]);

        // Skip separator row (index 1) and parse data rows
        const rows: string[][] = [];
        for (let r = 2; r < tableLines.length; r++) {
          rows.push(splitTableRow(tableLines[r]));
        }

        blocks.push({
          type: "table",
          tableHeaders: headers,
          tableRows: rows,
        });
      }
      continue;
    }

    // Image with optional caption: ![alt](url) or ![alt](url "caption")
    const imageMatch = line.match(/^!\[([^\]]*)\]\(([^\s"]+)(?:\s+"([^"]+)")?\)$/);
    if (imageMatch) {
      blocks.push({
        type: "image",
        alt: imageMatch[1],
        content: imageMatch[2],
        caption: imageMatch[3],
      });
      i++;
      continue;
    }

    // Callout block (:::note, :::tip, :::warning, :::question)
    const calloutMatch = line.match(/^:::(note|tip|warning|question)\s*(.*)$/);
    if (calloutMatch) {
      const variant = calloutMatch[1] as "note" | "tip" | "warning" | "question";
      const title = calloutMatch[2].trim() || variant.charAt(0).toUpperCase() + variant.slice(1);
      const contentLines: string[] = [];
      
      i++;
      while (i < lines.length && !lines[i].startsWith(":::")) {
        contentLines.push(lines[i]);
        i++;
      }
      i++; // Skip closing :::
      
      blocks.push({
        type: "callout",
        calloutVariant: variant,
        calloutTitle: title,
        content: contentLines.join("\n").trim(),
      });
      continue;
    }

    // Paragraph (collect consecutive non-empty lines)
    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith("```") &&
      !lines[i].startsWith("> ") &&
      !lines[i].match(/^[-*]\s/) &&
      !lines[i].match(/^\d+\.\s/) &&
      !lines[i].match(/^---+$/) &&
      !lines[i].match(/^!\[.*\]\(.*\)$/) &&
      !(lines[i].startsWith("|") && lines[i].endsWith("|"))
    ) {
      paragraphLines.push(lines[i]);
      i++;
    }

    if (paragraphLines.length > 0) {
      const content = paragraphLines.join(" ");
      // Check if content has inline code
      if (content.includes("`")) {
        blocks.push({
          type: "inline-code",
          content,
        });
      } else {
        blocks.push({
          type: "paragraph",
          content,
        });
      }
    }
  }

  return blocks;
}

/**
 * Parse a complete markdown file into a BlogPost
 */
export function parseMarkdown(content: string): BlogPost {
  const { frontMatter, body } = parseFrontMatter(content);
  const contentBlocks = parseMarkdownToBlocks(body);

  // Parse tags from comma-separated string to array
  const tags = frontMatter.tags 
    ? frontMatter.tags.split(",").map(tag => tag.trim()).filter(Boolean)
    : undefined;

  return {
    id: frontMatter.id,
    title: frontMatter.title,
    category: frontMatter.category,
    date: frontMatter.date,
    tags,
    content: contentBlocks,
  };
}

/**
 * Load all markdown posts from the content directory
 * This uses Vite's glob import feature
 */
export async function loadMarkdownPosts(): Promise<BlogPost[]> {
  const postModules = import.meta.glob("/src/content/posts/*.md", {
    query: "?raw",
    import: "default",
  });

  const posts: BlogPost[] = [];

  for (const path in postModules) {
    try {
      const content = (await postModules[path]()) as string;
      const post = parseMarkdown(content);
      posts.push(post);
    } catch (error) {
      console.error(`Error loading post from ${path}:`, error);
    }
  }

  // Sort by date (newest first)
  posts.sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return posts;
}

// Cache for post modules to avoid re-importing
const postModulesCache = import.meta.glob("/src/content/posts/*.md", {
  query: "?raw",
  import: "default",
});

/**
 * Load only metadata (frontmatter) for all posts - lightweight for sidebar/listing
 */
export async function loadPostsMetadata(): Promise<PostMetadata[]> {
  const posts: PostMetadata[] = [];

  for (const path in postModulesCache) {
    try {
      const content = (await postModulesCache[path]()) as string;
      const { frontMatter } = parseFrontMatter(content);
      
      const tags = frontMatter.tags 
        ? frontMatter.tags.split(",").map(tag => tag.trim()).filter(Boolean)
        : undefined;

      posts.push({
        id: frontMatter.id,
        title: frontMatter.title,
        category: frontMatter.category,
        date: frontMatter.date,
        tags,
      });
    } catch (error) {
      console.error(`Error loading metadata from ${path}:`, error);
    }
  }

  // Sort by date (newest first)
  posts.sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return posts;
}

// Cache for loaded full posts
const fullPostsCache = new Map<string, BlogPost>();

/**
 * Load a single post by ID - with caching
 */
export async function loadPostById(postId: string): Promise<BlogPost | null> {
  // Check cache first
  if (fullPostsCache.has(postId)) {
    return fullPostsCache.get(postId)!;
  }

  for (const path in postModulesCache) {
    try {
      const content = (await postModulesCache[path]()) as string;
      const { frontMatter } = parseFrontMatter(content);
      
      if (frontMatter.id === postId) {
        const post = parseMarkdown(content);
        fullPostsCache.set(postId, post);
        return post;
      }
    } catch (error) {
      console.error(`Error loading post from ${path}:`, error);
    }
  }

  return null;
}