import { MichelinHeader } from "../_components/MichelinHeader";
import { FaqClient } from "./FaqClient";

export default function Faq() {
  return (
    <div className="flex min-h-[100svh] flex-col bg-fond text-encre">
      <MichelinHeader />
      <FaqClient />
    </div>
  );
}
