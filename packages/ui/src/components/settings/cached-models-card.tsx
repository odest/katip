"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Trash2, HardDriveDownload } from "lucide-react";
import {
  getCachedModels,
  deleteCachedModel,
  deleteAllCachedModels,
} from "@workspace/ui/lib/utils";
import { WHISPER_MODELS } from "@workspace/ui/config/models";
import { useModelStore } from "@workspace/ui/stores/model-store";
import { useTranslations } from "@workspace/i18n";
import { toast } from "sonner";

export function CachedModelsCard() {
  const t = useTranslations("CachedModelsCard");
  const [cachedModelIds, setCachedModelIds] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<string | null>(null);
  const { useQuantized } = useModelStore();

  const cachedModelsDetails = WHISPER_MODELS.filter((model) =>
    cachedModelIds.has(model.id)
  );

  const modelToDeleteDetails = modelToDelete
    ? WHISPER_MODELS.find((m) => m.id === modelToDelete)
    : null;

  const refreshCachedModels = useCallback(async () => {
    try {
      const models = await getCachedModels();
      setCachedModelIds(models);
    } catch (error) {
      console.error("Error fetching cached models:", error);
    }
  }, []);

  useEffect(() => {
    refreshCachedModels();
  }, [refreshCachedModels]);

  const handleDeleteModel = async (modelId: string) => {
    try {
      const deleted = await deleteCachedModel(modelId);

      if (deleted) {
        const modelName =
          WHISPER_MODELS.find((m) => m.id === modelId)?.name || modelId;
        toast.success(
          t("modelDeleted", {
            modelName,
          })
        );
        await refreshCachedModels();
      } else {
        toast.warning(t("modelNotFound"));
      }
    } catch (error) {
      console.error("Error deleting model from cache:", error);
    } finally {
      setDeleteDialogOpen(false);
      setModelToDelete(null);
    }
  };

  const handleDeleteAllModels = async () => {
    try {
      const success = await deleteAllCachedModels();

      if (success) {
        toast.success(t("allModelsDeleted"));
        await refreshCachedModels();
      } else {
        toast.info(t("noCacheToDelete"));
      }
    } catch (error) {
      console.error("Error deleting all models from cache:", error);
    } finally {
      setDeleteAllDialogOpen(false);
    }
  };

  const openDeleteDialog = (modelId: string) => {
    setModelToDelete(modelId);
    setDeleteDialogOpen(true);
  };

  const openDeleteAllDialog = () => {
    setDeleteAllDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {cachedModelsDetails.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {t("totalModels", {
                    count: cachedModelsDetails.length,
                  })}
                </p>
                <div className="flex gap-2">
                  <Button variant="destructive" onClick={openDeleteAllDialog}>
                    <Trash2 />
                    {t("deleteAll")}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {cachedModelsDetails.map((model) => (
                  <div
                    key={model.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                        <HardDriveDownload className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{model.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {useQuantized ? model.quantizedSize : model.size}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(model.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12 border-2 border-dashed rounded-lg">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <HardDriveDownload className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-base mb-1">
                {t("noModelsCachedTitle")}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {t("noModelsCachedDescription")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteModelTitle")}</DialogTitle>
            <DialogDescription>
              {modelToDeleteDetails
                ? t("deleteModelDescription", {
                    modelName: modelToDeleteDetails.name,
                  })
                : t("deleteModelDescriptionGeneric")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => modelToDelete && handleDeleteModel(modelToDelete)}
            >
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteAllTitle")}</DialogTitle>
            <DialogDescription>
              {t("deleteAllDescription", {
                count: cachedModelsDetails.length,
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteAllDialogOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteAllModels}>
              {t("deleteAll")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
