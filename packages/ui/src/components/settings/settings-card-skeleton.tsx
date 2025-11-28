import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

interface ThemesCardSkeletonProps {
  gridClasses: string;
  itemCount?: number;
}

export const ThemesCardSkeleton = ({
  gridClasses,
  itemCount = 3,
}: ThemesCardSkeletonProps) => {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-24 mb-2" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className={gridClasses}>
        {[...Array(itemCount)].map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="aspect-video rounded-lg" />
            <div className="flex items-center gap-2">
              <Skeleton className="w-4 h-4 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export const ProfileImageCardSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-56 max-w-full" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <Skeleton className="h-20 w-20 rounded-full shrink-0" />
            <div className="flex flex-col gap-0.5 flex-1">
              <Skeleton className="h-3 w-48 max-w-full" />
              <Skeleton className="h-3 w-40 max-w-full" />
              <Skeleton className="h-3 w-52 max-w-full" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 w-full sm:w-auto sm:shrink-0">
            <Skeleton className="h-9 flex-1 sm:flex-none sm:w-36" />
            <Skeleton className="h-9 flex-1 sm:flex-none sm:w-36" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const AccountInfoCardSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <div className="grid gap-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-20" />
              <div className="flex flex-col sm:flex-row gap-2">
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="h-9 w-full sm:w-24" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-16" />
              <div className="flex flex-col sm:flex-row gap-2">
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="h-9 w-full sm:w-24" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ChangePasswordCardSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-full" />
          </div>
          <Skeleton className="h-9 w-full mt-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export const DangerZoneCardSkeleton = () => {
  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-9 w-full" />
        </div>
      </CardContent>
    </Card>
  );
};

export const AccountTabSkeleton = () => {
  return (
    <div className="grid gap-6">
      <ProfileImageCardSkeleton />
      <AccountInfoCardSkeleton />
      <ChangePasswordCardSkeleton />
      <DangerZoneCardSkeleton />
    </div>
  );
};

export const GuestCardSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center py-12 border-2 border-dashed rounded-lg">
          <Skeleton className="h-20 w-20 rounded-full mx-auto mb-2" />
          <Skeleton className="h-6 w-30 mb-2" />
          <Skeleton className="h-4 w-56" />
          <div className="flex flex-col sm:flex-row gap-3 p-6 w-full sm:w-auto px-4 sm:px-0">
            <Skeleton className="h-9 w-full sm:w-40" />
            <Skeleton className="h-9 w-full sm:w-40" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
