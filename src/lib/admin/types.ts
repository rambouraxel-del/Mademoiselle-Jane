export type MediaItem = {
  id: string;
  url: string;
  path: string;
  width: number;
  height: number;
  alt: string;
  focalX: number;
  focalY: number;
  isPlaceholder: boolean;
  createdAt: string;
  sizeBytes: number;
  originalFilename: string | null;
};
