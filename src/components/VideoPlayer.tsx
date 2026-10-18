import React, { useState } from 'react';

interface VideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, title = 'Film', poster }) => {
  const [error, setError] = useState(false);
  return (
    <section aria-label={title} className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-950">
      <video
        controls
        preload="metadata"
        poster={poster}
        className="w-full aspect-video bg-black"
        src={src}
        onError={() => setError(true)}
      />
      {error && <p role="alert" className="p-3 text-sm text-amber-200">Ten film nie może zostać odtworzony w tej wersji Electron.</p>}
    </section>
  );
};
