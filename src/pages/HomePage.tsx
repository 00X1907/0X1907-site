import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TopBar } from "@/components/blog/TopBar";
import { loadMarkdownPosts, type BlogPost } from "@/data/blogPosts";
import { ArrowRight } from "lucide-react";

const HomePage = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const loadedPosts = await loadMarkdownPosts();
        setPosts(loadedPosts);
      } catch (error) {
        console.error("Failed to load posts:", error);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);

  // Show only the 3 most recent posts
  const recentPosts = posts.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar showMenuButton={false} />
      <main className="flex-1 py-16 md:py-24 px-4 sm:px-6 md:px-8 bg-background">
        <div className="max-w-[600px] mx-auto">
          {/* Author Section */}
          <section className="mb-16 md:mb-20">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              Lohith Srikar
            </h1>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-4">
              Researcher exploring the intersection of machine learning, reinforcement learning, 
              and neural architectures. Currently focused on transformer models and their applications 
              in complex reasoning tasks.
            </p>
            <p className="text-muted-foreground text-sm">
              PhD Candidate · AI Research Lab · 
              <a href="mailto:lohith@example.com" className="ml-1 underline underline-offset-4 hover:text-foreground transition-colors">
                lohith@example.com
              </a>
            </p>
          </section>

          {/* Recent Papers Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Recent Papers
              </h2>
              <Link 
                to="/blog" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="text-muted-foreground text-sm">Loading...</div>
            ) : (
              <ul className="space-y-1">
                {recentPosts.map((post) => (
                  <li key={post.id}>
                    <Link
                      to={`/blog/${post.id}`}
                      className="group flex items-baseline justify-between py-3 border-b border-border hover:border-muted-foreground/30 transition-colors"
                    >
                      <span className="text-foreground group-hover:text-muted-foreground transition-colors font-medium">
                        {post.title}
                      </span>
                      {post.date && (
                        <span className="text-xs text-muted-foreground ml-4 shrink-0">
                          {post.date}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
