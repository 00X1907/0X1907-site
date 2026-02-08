import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TopBar } from "@/components/blog/TopBar";
import { Sidebar } from "@/components/blog/Sidebar";
import { BlogContent } from "@/components/blog/BlogContent";
import { loadPostsMetadata, loadPostById, type BlogPost, type PostMetadata } from "@/data/blogPosts";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [postsMetadata, setPostsMetadata] = useState<PostMetadata[]>([]);
  const [activePost, setActivePost] = useState<BlogPost | null>(null);
  const [activePostId, setActivePostId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [postLoading, setPostLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();

  // Load metadata on mount
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const metadata = await loadPostsMetadata();
        setPostsMetadata(metadata);
        
        // Determine which post to show
        if (postId) {
          if (metadata.some(p => p.id === postId)) {
            setActivePostId(postId);
            setNotFound(false);
          } else {
            setNotFound(true);
          }
        } else if (metadata.length > 0) {
          setActivePostId(metadata[0].id);
          setNotFound(false);
        }
      } catch (error) {
        console.error("Failed to load posts metadata:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMetadata();
  }, [postId]);

  // Load full post content when activePostId changes
  useEffect(() => {
    if (!activePostId) return;

    const loadPost = async () => {
      setPostLoading(true);
      try {
        const post = await loadPostById(activePostId);
        setActivePost(post);
      } catch (error) {
        console.error("Failed to load post:", error);
      } finally {
        setPostLoading(false);
      }
    };

    loadPost();
  }, [activePostId]);

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

  // Get active post metadata for sidebar folder
  const activePostMeta = postsMetadata.find((post) => post.id === activePostId);

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <TopBar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} showTagsLink />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
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
          posts={postsMetadata}
          activePostId={activePostId}
          onSelectPost={handleSelectPost}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          initialActiveFolder={activePostMeta?.category ?? null}
        />
        {/* Overlay for mobile when sidebar is open */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {postLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-muted-foreground">Loading post...</div>
          </div>
        ) : activePost ? (
          <BlogContent post={activePost} />
        ) : null}
      </div>
    </div>
  );
};

export default Index;
