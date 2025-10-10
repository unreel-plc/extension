import { useGetProssingBookmarks } from "@/hooks/use-engine";
import DownloadProgress from "@/components/download-progress";
import DownloadNotifications from "@/components/download-notifications";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Downloads = () => {
  const { data: pendingItems, isLoading } = useGetProssingBookmarks({
    limit: 200,
  });

  return (
    <div className="px-4 py-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Downloads</h1>
        <DownloadNotifications />
      </div>

      <Tabs defaultValue="realtime" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="realtime">Real-time Progress</TabsTrigger>
          <TabsTrigger value="processing">Processing Queue</TabsTrigger>
        </TabsList>

        {/* Real-time WebSocket Downloads */}
        <TabsContent value="realtime" className="mt-6">
          <DownloadProgress />
        </TabsContent>

        {/* Legacy Processing Queue */}
        <TabsContent value="processing" className="mt-6">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading...
            </div>
          ) : pendingItems?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending items
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {pendingItems?.map((p) => (
                <div
                  key={p._id}
                  className="mb-4 break-inside-avoid rounded-3xl p-2 bg-white dark:bg-black shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                >
                  <div className="group block rounded-2xl overflow-hidden bg-white/70 dark:bg-white/5 backdrop-blur-sm">
                    <div className="relative">
                      <div className="w-full aspect-[9/16] bg-muted/60 grid place-items-center">
                        <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
                          <span>Processing…</span>
                          <div className="w-24 h-1.5 rounded-full bg-muted">
                            <div
                              className="h-1.5 rounded-full bg-primary transition-all"
                              style={{
                                width: `${Math.max(
                                  0,
                                  Math.min(100, p.progressPercent ?? 0)
                                )}%`,
                              }}
                            />
                          </div>
                          <span>{Math.round(p.progressPercent ?? 0)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Downloads;
