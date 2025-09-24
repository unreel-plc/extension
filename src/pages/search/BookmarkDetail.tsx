import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  Heart,
  Eye,
  MessageCircle,
  Calendar,
  User,
} from "lucide-react";
import type { Bookmark } from "@/hooks/use-engine";

const BookmarkDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookmark = (location.state as Bookmark | undefined) || undefined;

  const formatCount = (num: number) => {
    if (num == null) return "0";
    if (num < 1000) return `${num}`;
    if (num < 1_000_000)
      return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}K`;
    return `${(num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1)}M`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const year = dateString.slice(0, 4);
    const month = dateString.slice(4, 6);
    const day = dateString.slice(6, 8);
    return new Date(`${year}-${month}-${day}`).toLocaleDateString();
  };

  if (!bookmark) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-muted/20">
        <div className="text-center space-y-4 p-8 rounded-2xl bg-white/70 dark:bg-black/70 backdrop-blur-sm border border-border/50 shadow-xl">
          <div className="text-6xl">😔</div>
          <h2 className="text-xl font-semibold text-foreground">
            Video Not Found
          </h2>
          <p className="text-muted-foreground">
            The video details are unavailable.
          </p>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to results
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Card */}
            <div className="rounded-3xl overflow-hidden bg-white/70 dark:bg-black/70 backdrop-blur-sm border border-border/50 shadow-xl">
              <div className="relative aspect-video bg-black rounded-t-3xl overflow-hidden">
                <a
                  href=""
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(bookmark.link, "_blank", "noopener,noreferrer");
                  }}
                  className="block w-full h-full group cursor-pointer"
                >
                  <img
                    src={
                      import.meta.env.VITE_BASE_URL + "/" + bookmark.thumbnail
                    }
                    alt={bookmark.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm rounded-full p-4">
                      <ExternalLink className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </a>
              </div>

              {/* Video Info */}
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <h1 className="text-xl lg:text-2xl font-bold leading-tight text-foreground flex-1">
                    {bookmark.title}
                  </h1>
                  {bookmark.platform === "youtube" && (
                    <img
                      src="https://www.youtube.com/s/desktop/9b55e232/img/favicon_32x32.png"
                      alt="YouTube"
                      className="h-6 w-6 shrink-0 rounded-md"
                    />
                  )}
                  {bookmark.platform === "tiktok" && (
                    <img
                      src="https://www.tiktok.com/favicon.ico"
                      alt="TikTok"
                      className="h-6 w-6 shrink-0 rounded-full"
                    />
                  )}
                  {bookmark.platform === "instagram" && (
                    <img
                      src="https://static.cdninstagram.com/rsrc.php/v4/yR/r/lam-fZmwmvn.png"
                      alt="Instagram"
                      className="h-6 w-6 shrink-0 rounded-full"
                    />
                  )}
                  {bookmark.platform === "facebook" && (
                    <img
                      src="https://img.icons8.com/color/48/facebook-new.png"
                      alt="Facebook"
                      className="h-6 w-6 shrink-0 rounded-full"
                    />
                  )}
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{bookmark.channel}</span>
                  {bookmark.channelFollowerCount && (
                    <span className="text-xs bg-muted px-2 py-1 rounded-full">
                      {formatCount(bookmark.channelFollowerCount)} followers
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 px-3 py-2 rounded-full">
                    <Heart className="h-4 w-4" />
                    <span className="font-medium">
                      {formatCount(bookmark.likeCount || 0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-3 py-2 rounded-full">
                    <Eye className="h-4 w-4" />
                    <span className="font-medium">
                      {formatCount(bookmark.viewCount || 0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 px-3 py-2 rounded-full">
                    <MessageCircle className="h-4 w-4" />
                    <span className="font-medium">
                      {formatCount(bookmark.commentCount || 0)}
                    </span>
                  </div>
                  {bookmark.uploadDate && (
                    <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 px-3 py-2 rounded-full">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">
                        {formatDate(bookmark.uploadDate)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  <a
                    href={bookmark.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl hover:from-primary/90 hover:to-primary/70 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Watch on{" "}
                    {bookmark.platform.charAt(0).toUpperCase() +
                      bookmark.platform.slice(1)}
                  </a>
                </div>
              </div>
            </div>

            {/* Description */}
            {bookmark.description && (
              <div className="rounded-2xl bg-white/70 dark:bg-black/70 backdrop-blur-sm border border-border/50 shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-3 text-foreground">
                  Description
                </h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words leading-relaxed">
                  {bookmark.description}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Categories & Tags */}
            {((bookmark.categories && bookmark.categories.length > 0) ||
              (bookmark.tags && bookmark.tags.length > 0)) && (
              <div className="rounded-2xl bg-white/70 dark:bg-black/70 backdrop-blur-sm border border-border/50 shadow-lg p-6 space-y-4">
                {bookmark.categories && bookmark.categories.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-foreground">
                      Categories
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {bookmark.categories.map((category, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gradient-to-r from-primary/10 to-primary/5 text-primary border border-primary/20 rounded-full text-xs font-medium"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {bookmark.tags && bookmark.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-foreground">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {bookmark.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-muted/60 text-muted-foreground rounded-lg text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Flashcard Summary */}
            {bookmark.flashcardSummary && (
              <div className="rounded-2xl bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/30 dark:to-orange-950/30 backdrop-blur-sm border border-amber-200/50 dark:border-amber-800/30 shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-3 text-amber-900 dark:text-amber-100 flex items-center gap-2">
                  <span className="text-xl">🎯</span>
                  Key Points
                </h3>
                <div className="text-sm text-amber-800 dark:text-amber-200 whitespace-pre-wrap break-words leading-relaxed">
                  {bookmark.flashcardSummary}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookmarkDetail;
