import { Suspense } from "react";
import { AlbumPageContent } from "./AlbumPageContent";

export default function AlbumsPage() {
  return (
    <Suspense>
      <AlbumPageContent />
    </Suspense>
  );
}
