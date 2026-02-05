import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://0x1907.netlify.app'; // Update with your actual URL
const SITE_TITLE = '0x1907';
const SITE_DESCRIPTION = 'A blog about programming, systems, and engineering';

interface PostMeta {
  id: string;
  title: string;
  category: string;
  date?: string;
  tags?: string[];
}

function parseFrontMatter(content: string): PostMeta | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const frontMatter: Record<string, string> = {};
  match[1].split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      frontMatter[key] = value;
    }
  });

  return {
    id: frontMatter.id || '',
    title: frontMatter.title || '',
    category: frontMatter.category || '',
    date: frontMatter.date,
    tags: frontMatter.tags?.split(',').map(t => t.trim()),
  };
}

function getExcerpt(content: string): string {
  // Remove frontmatter
  const body = content.replace(/^---[\s\S]*?---\n/, '');
  // Get first paragraph
  const firstPara = body.split('\n\n').find(p => p.trim() && !p.startsWith('#') && !p.startsWith('!'));
  return firstPara?.slice(0, 200).replace(/[#*`\[\]]/g, '') + '...' || '';
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateRSS(): void {
  const rootDir = path.resolve(__dirname, '..');
  const postsDir = path.join(rootDir, 'src/content/posts');
  const publicDir = path.join(rootDir, 'public');

  if (!fs.existsSync(postsDir)) {
    console.error('Posts directory not found:', postsDir);
    return;
  }

  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
  const posts: (PostMeta & { excerpt: string })[] = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(postsDir, file), 'utf-8');
    const meta = parseFrontMatter(content);
    if (meta) {
      posts.push({
        ...meta,
        excerpt: getExcerpt(content),
      });
    }
  }

  // Sort by date (newest first)
  posts.sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const rssItems = posts.map(post => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}/blog/${post.id}</link>
      <guid>${SITE_URL}/blog/${post.id}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <category>${escapeXml(post.category)}</category>
      ${post.date ? `<pubDate>${new Date(post.date).toUTCString()}</pubDate>` : ''}
    </item>`).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`;

  fs.writeFileSync(path.join(publicDir, 'rss.xml'), rss.trim());
  console.log('✓ RSS feed generated: public/rss.xml');
}

generateRSS();
