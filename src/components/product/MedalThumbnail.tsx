import { decodeMedalImage } from "@/utils/mediaCode";
import { MedalPlaceholder } from "@/components/ui/MedalPlaceholder";
import { cn } from "@/utils/cn";

export function MedalThumbnail({ image, className }: { image: string; className?: string }) {
  const decoded = decodeMedalImage(image);

  if (decoded) {
    return <MedalPlaceholder shape={decoded.shape} colors={decoded.colors} className={className} />;
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={image} alt="" className={cn("h-full w-full object-cover", className)} />;
}
