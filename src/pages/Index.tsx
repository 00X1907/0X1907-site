import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TopBar } from "@/components/blog/TopBar";
import { Sidebar } from "@/components/blog/Sidebar";
import { BlogContent } from "@/components/blog/BlogContent";
import { loadMarkdownPosts, type BlogPost } from "@/data/blogPosts";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [activePostId, setActivePostId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const loadedPosts = await loadMarkdownPosts();
        setPosts(loadedPosts);
        // If postId is provided in URL, check if it exists
        if (postId) {
          if (loadedPosts.some(p => p.id === postId)) {
            setActivePostId(postId);
            setNotFound(false);
          } else {
            setNotFound(true);
          }
        } else if (loadedPosts.length > 0) {
          setActivePostId(loadedPosts[0].id);
          setNotFound(false);
        }
      } catch (error) {
        console.error("Failed to load posts:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [postId]);

  // Close sidebar on mobile by default
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const handleSelectPost = (id: string) => {
    setActivePostId(id);
    navigate(`/blog/${id}`);
    // Close sidebar on mobile after selecting a post
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const activePost = posts.find((post) => post.id === activePostId) || posts[0];

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <TopBar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} showTagsLink />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-muted-foreground">Loading posts...</div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <TopBar sidebarOpen={false} onToggleSidebar={() => {}} showTagsLink />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="mb-4 text-6xl font-bold text-foreground">404</h1>
            <p className="mb-2 text-xl text-muted-foreground">Post not found</p>
            <p className="mb-6 text-muted-foreground">
              The post "{postId}" doesn't exist.
            </p>
            <a 
              href="/" 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              ← Back to posts
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <TopBar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} showTagsLink />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          posts={posts}
          activePostId={activePostId}
          onSelectPost={handleSelectPost}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        {/* Overlay for mobile when sidebar is open */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {activePost && <BlogContent post={activePost} />}
      </div>
    </div>
  );
};

export default Index;
