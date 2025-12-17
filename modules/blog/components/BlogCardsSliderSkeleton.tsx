import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

export default function BlogCardsSliderSkeleton ()  {
  return (
    <div className="relative group">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled
            className="hidden sm:flex"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled
            className="hidden sm:flex"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button disabled variant="default" className="gap-2">
            View All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Slider */}
      <div className="flex gap-6 overflow-x-hidden pb-4">
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className="flex-shrink-0 w-[320px] sm:w-[380px]"
          >
            <Card className="h-full overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
              {/* Image Skeleton */}
              <Skeleton className="relative aspect-[16/9] w-full" />

              {/* Content */}
              <CardContent className="p-6 space-y-4">
                {/* Tags Skeleton */}
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>

                {/* Title Skeleton */}
                <div className="space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                </div>

                {/* Excerpt Skeleton */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>

                {/* Meta Skeleton */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <Skeleton className="h-4 w-24" />
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}

        {/* View All Card Skeleton */}
        <div className="flex-shrink-0 w-[320px] sm:w-[380px]">
          <Card className="h-full flex items-center justify-center border-2 border-dashed border-muted bg-muted/20">
            <CardContent className="text-center py-12">
              <Skeleton className="mb-4 mx-auto w-16 h-16 rounded-full" />
              <Skeleton className="h-7 w-48 mx-auto mb-2" />
              <Skeleton className="h-5 w-56 mx-auto" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};