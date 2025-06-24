import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { VideoOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

const extractYouTubeInfo = (url) => {
  if (!url) return { videoId: null, playlistId: null };
  const videoIdRegex = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const playlistIdRegex = /[?&]list=([^&]+)/;
  const videoIdMatch = url.match(videoIdRegex);
  const playlistIdMatch = url.match(playlistIdRegex);
  return {
    videoId: videoIdMatch ? videoIdMatch[1] : null,
    playlistId: playlistIdMatch ? playlistIdMatch[1] : null,
  };
};

const LiveStreamPlayer = ({ config }) => {
  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );
    const currentVideoRef = videoRef.current;
    if (currentVideoRef) {
      observer.observe(currentVideoRef);
    }
    return () => {
      if (currentVideoRef) {
        observer.unobserve(currentVideoRef);
      }
    };
  }, []);

  if (!config || (!config.liveUrl && !config.fallbackUrl)) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center text-muted-foreground">
        <VideoOff className="h-12 w-12 mb-2" />
        <p>Nenhum vídeo disponível no momento.</p>
        <p className="text-sm">O administrador pode configurar na página "Estúdio".</p>
      </div>
    );
  }

  const urlToUse = config.liveUrl || config.fallbackUrl;
  const playerType = config.playerType || 'url';

  const renderMotionDiv = (content) => (
    <motion.div
      ref={videoRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full overflow-hidden rounded-lg shadow-lg"
      style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}
    >
      <div className="absolute top-0 left-0 w-full h-full">
        {content}
      </div>
    </motion.div>
  );

  let finalPlayer;

  if (playerType === 'iframe') {
    const iframeSrcMatch = urlToUse.match(/src="([^"]*)"/);
    if (!iframeSrcMatch || !iframeSrcMatch[1]) {
      finalPlayer = (
        <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center text-destructive">
          Código do Iframe inválido. Verifique o código no painel Estúdio.
        </div>
      );
    } else {
      let sanitizedIframeSrc = iframeSrcMatch[1];
      sanitizedIframeSrc = sanitizedIframeSrc.replace(/autoplay=1/g, `autoplay=${isVisible ? 1 : 0}`);
      sanitizedIframeSrc = sanitizedIframeSrc.replace(/mute=1/g, `mute=${isMuted ? 1 : 0}`);
      
      finalPlayer = (
        <iframe
            key={`${sanitizedIframeSrc}-${isVisible}`}
            src={isVisible ? sanitizedIframeSrc : ''}
            title="Culto Ao Vivo"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
        ></iframe>
      );
    }
  } else {
    const { videoId, playlistId } = extractYouTubeInfo(urlToUse);
    if (!videoId && !playlistId) {
      finalPlayer = (
        <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center text-destructive">
          Link do YouTube inválido. Verifique o link no painel Estúdio.
        </div>
      );
    } else {
      let embedUrl;
      if (playlistId) {
        embedUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&mute=${isMuted ? 1 : 0}&playsinline=1&controls=1`;
      } else if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&playsinline=1&controls=1&loop=1&playlist=${videoId}`;
      }
      
      finalPlayer = (
        <iframe
          key={`${embedUrl}-${isVisible}`}
          src={isVisible ? embedUrl : ''}
          title="Culto Ao Vivo"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      );
    }
  }

  return renderMotionDiv(
    <>
      {finalPlayer}
      <div className="absolute bottom-3 right-3">
        <Button size="icon" variant="secondary" onClick={() => setIsMuted(!isMuted)} className="rounded-full bg-black/50 hover:bg-black/70 text-white">
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
      </div>
    </>
  );
};

export default LiveStreamPlayer;