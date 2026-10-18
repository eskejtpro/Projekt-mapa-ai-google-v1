import React, { useState, useRef, useEffect } from 'react';
import { Film } from 'lucide-react';

const VideoThumbnailView: React.FC<{ src: string; title: string }> = ({ src, title }) => {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const player = useRef<HTMLVideoElement>(null);
  const holder = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const element = holder.current;
    if (!element) return;
    const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect(); } }, { rootMargin: '100px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const video = player.current;
    return () => { if (video) { video.pause(); video.removeAttribute('src'); video.load(); } };
  }, [src, visible, thumbnail, failed]);
  const capture = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    if (!video.videoWidth || !video.videoHeight) return;
    const canvas = document.createElement('canvas');
    const width = 480;
    canvas.width = width;
    canvas.height = Math.round(width * video.videoHeight / video.videoWidth);
    const context = canvas.getContext('2d');
    if (!context) return;
    try {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      setThumbnail(canvas.toDataURL('image/jpeg', 0.78));
    } catch { setFailed(true); }
  };
  return <><span ref={holder} className="absolute inset-0 pointer-events-none" />{visible && !thumbnail && !failed && <video ref={player} crossOrigin="anonymous" src={src} muted preload="metadata" onError={() => setFailed(true)} onLoadedMetadata={event => { event.currentTarget.currentTime = Math.min(0.1, event.currentTarget.duration || 0); }} onSeeked={capture} className="absolute w-px h-px opacity-0 pointer-events-none" aria-hidden="true" />}{thumbnail ? <img src={thumbnail} alt={title} className="absolute inset-0 w-full h-full object-cover" /> : <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400"><Film className="w-12 h-12 text-amber-300" /><span className="text-xs">{failed ? 'Podgląd niedostępny' : 'Miniatura filmu'}</span></div>}</>;
};

export const VideoThumbnail = React.memo(VideoThumbnailView);
