import { YouTubeConverter } from "./ytb/youtube-converter";

export function meta() {
  return [
    { title: `${import.meta.env.VITE_APP_NAME} | Dashboard` }, // Sets the page title
  ];
}

export interface IIndexProps {}

export default function Dashboard(props: IIndexProps) {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            YouTube Audio Extractor
          </h1>
          <p className="text-lg text-muted-foreground text-balance">
            Extract audio and convert YouTube video content into text
          </p>
        </div>

        <YouTubeConverter />
      </div>
    </main>
  );
}
