import React, { useState } from 'react';
import { Film } from 'lucide-react';

export const VideoThumbnail: React.FC<{ src: string; title: string }> = ({ src, title }) => {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const capture = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    if (!video.videoWidth || !video.videoHeight) return;
    const canvas = document.createElement('canvas');
    const width = 480;
    canvas.width = width;
    canvas.height = Math.round(width * video.videoHeight / video.videoWidth);
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setThumbnail(canvas.toDataURL('image/jpeg', 0.78));
  };
  return <><video src={src} muted preload="metadata" onLoadedMetadata={event => { event.currentTarget.currentTime = Math.min(0.1, event.currentTarget.duration || 0); }} onLoadedData={capture} onSeeked={capture} className="absolute w-px h-px opacity-0 pointer-events-none" aria-hidden="true" />{thumbnail ? <img src={thumbnail} alt={title} className="absolute inset-0 w-full h-full object-cover" /> : <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400"><Film className="w-12 h-12 text-indigo-300" /><span className="text-[10px]">Miniatura filmu</span></div>}</>;
};
