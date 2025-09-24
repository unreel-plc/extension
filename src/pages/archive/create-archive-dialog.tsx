import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateArchive } from "@/hooks/use-archives";
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
import { Plus, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  createArchiveSchema,
  type CreateArchiveInput,
} from "@/lib/validations/archive";

interface CreateArchiveDialogProps {
  children?: React.ReactNode;
}

const CreateArchiveDialog = ({ children }: CreateArchiveDialogProps) => {
  const [open, setOpen] = useState(false);

  const createArchive = useCreateArchive();

  const form = useForm<CreateArchiveInput>({
    resolver: zodResolver(createArchiveSchema),
    defaultValues: {
      name: "",
      description: "",
    },
    mode: "onChange", // Validate on change for better UX
  });

  const onSubmit = async (data: CreateArchiveInput) => {
    try {
      await createArchive.mutateAsync({
        name: data.name,
        description: data.description || "",
      });

      // Show success toast
      toast.success("Collection created successfully!", {
        description: `"${data.name}" has been added to your collections.`,
      });

      // Reset form and close dialog
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Failed to create collection:", error);
      toast.error("Failed to create collection", {
        description: "Please try again or check your connection.",
      });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!createArchive.isPending) {
      setOpen(newOpen);
      if (!newOpen) {
        // Reset form when closing
        form.reset();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button
            size="icon"
            className="group fixed bottom-20 right-4 md:bottom-6 md:right-6 h-14 w-14 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 z-50 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 border-0"
          >
            <Plus className="h-6 w-6 transition-transform duration-300 group-hover:rotate-90" />
            <span className="sr-only">Create new collection</span>
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
                Create Collection
              </h2>
              <p className="text-sm text-muted-foreground font-light">
                Organize your favorite content
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
                        disabled={createArchive.isPending}
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
                        disabled={createArchive.isPending}
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
                  disabled={createArchive.isPending}
                  className="h-11 px-6 rounded-xl font-medium transition-all duration-200 hover:bg-muted/50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createArchive.isPending}
                  className="h-11 px-8 rounded-xl font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {createArchive.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>Save</>
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

export default CreateArchiveDialog;
