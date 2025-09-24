import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Archive } from "@/hooks/use-archives";
import { useDeleteArchive } from "@/hooks/use-archives";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import UpdateArchiveDialog from "@/pages/archive/update-archive-dialog";
import {
  Calendar,
  Folder,
  MoreVertical,
  Star,
  Edit3,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface ArchiveCardProps {
  archive: Archive;
}

const ArchiveCard = ({ archive }: ArchiveCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteArchive = useDeleteArchive();
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      await deleteArchive.mutateAsync(archive._id);
      toast.success("Collection deleted successfully!", {
        description: `"${archive.name}" has been removed.`,
      });
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Failed to delete collection:", error);
      toast.error("Failed to delete collection", {
        description: "Please try again or check your connection.",
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      if (diffInDays === 0) return "Today";
      if (diffInDays === 1) return "Yesterday";
      if (diffInDays < 7) return `${diffInDays} days ago`;
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
      if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
      return `${Math.floor(diffInDays / 365)} years ago`;
    } catch {
      return "Unknown";
    }
  };

  return (
    <div className="group relative w-full rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-muted-foreground" />
            <h3
              className="font-semibold text-sm leading-tight overflow-hidden"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {archive.name}
            </h3>
          </div>
          <div className="flex items-center gap-1 relative z-10">
            {archive.isDefault && (
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <UpdateArchiveDialog archive={archive}>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit3 className="mr-2 h-4 w-4" />
                    Update Collection
                  </DropdownMenuItem>
                </UpdateArchiveDialog>
                {!archive.isDefault && (
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setShowDeleteDialog(true);
                    }}
                    variant="destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Collection
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {archive.description && (
          <p
            className="text-xs text-muted-foreground mb-3 overflow-hidden"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {archive.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(archive.createdAt)}</span>
          </div>

          {archive.isDefault && (
            <Badge variant="secondary" className="text-xs">
              Default
            </Badge>
          )}
        </div>
      </div>

      {/* Click overlay for navigation */}
      <button
        onClick={() => navigate(`/archive/${archive._id}`, { state: archive })}
        className="absolute inset-0 w-full h-full rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        aria-label={`Open ${archive.name} collection`}
        style={{ zIndex: 1 }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Collection"
        description={`Are you sure you want to delete "${archive.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteArchive.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ArchiveCard;
