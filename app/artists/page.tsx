import { Suspense } from "react";
import { ArtistPageContent } from "./ArtistPageContent";

export default function ArtistsPage() {
  return (
    <Suspense>
      <ArtistPageContent />
    </Suspense>
  );
}
