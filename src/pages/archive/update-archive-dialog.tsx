import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateArchive } from "@/hooks/use-archives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Sparkles, Edit3 } from "lucide-react";
import { toast } from "sonner";
import {
  createArchiveSchema,
  type CreateArchiveInput,
} from "@/lib/validations/archive";
import type { Archive } from "@/hooks/use-archives";

interface UpdateArchiveDialogProps {
  archive: Archive;
  children?: React.ReactNode;
  trigger?: React.ReactNode;
}

const UpdateArchiveDialog = ({
  archive,
  children,
  trigger,
}: UpdateArchiveDialogProps) => {
  const [open, setOpen] = useState(false);

  const updateArchive = useUpdateArchive();

  const form = useForm<CreateArchiveInput>({
    resolver: zodResolver(createArchiveSchema),
    defaultValues: {
      name: archive.name,
      description: archive.description || "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: CreateArchiveInput) => {
    try {
      await updateArchive.mutateAsync({
        id: archive._id,
        name: data.name,
        description: data.description || "",
      });

      // Show success toast
      toast.success("Collection updated successfully!", {
        description: `"${data.name}" has been updated.`,
      });

      // Reset form and close dialog
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Failed to update collection:", error);
      toast.error("Failed to update collection", {
        description: "Please try again or check your connection.",
      });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!updateArchive.isPending) {
      setOpen(newOpen);
      if (!newOpen) {
        // Reset form when closing
        form.reset({
          name: archive.name,
          description: archive.description || "",
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || children || (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Edit3 className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg border-0 shadow-2xl bg-card/95 backdrop-blur-xl">
        <div className="space-y-8 py-6">
          {/* Elegant Header */}
          <div className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-light tracking-tight text-foreground">
                Update Collection
              </h2>
              <p className="text-sm text-muted-foreground font-light">
                Modify your collection details
              </p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-sm font-medium text-foreground/80">
                      Collection Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter a memorable name..."
                        {...field}
                        disabled={updateArchive.isPending}
                        maxLength={50}
                        className="h-12 rounded-xl border-border/50 bg-background/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200 placeholder:text-muted-foreground/60"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-destructive/80" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-sm font-medium text-foreground/80">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="What's this collection about?"
                        {...field}
                        disabled={updateArchive.isPending}
                        maxLength={200}
                        className="h-12 rounded-xl border-border/50 bg-background/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200 placeholder:text-muted-foreground/60"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-destructive/80" />
                  </FormItem>
                )}
              />

              <DialogFooter className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleOpenChange(false)}
                  disabled={updateArchive.isPending}
                  className="h-11 px-6 rounded-xl font-medium transition-all duration-200 hover:bg-muted/50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateArchive.isPending}
                  className="h-11 px-8 rounded-xl font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {updateArchive.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Update Collection
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateArchiveDialog;
