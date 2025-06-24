import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { BookOpen, Users, Music, CalendarCheck, Network } from 'lucide-react';
import WelcomeLogo from '@/components/common/WelcomeLogo';

const slides = [
  {
    icon: BookOpen,
    title: "Liturgia Detalhada",
    description: "Planeje cultos com etapas, músicas e responsáveis. Tudo organizado em um só lugar."
  },
  {
    icon: Music,
    title: "Repertório Musical",
    description: "Crie, organize e acesse o repertório de músicas da sua igreja com facilidade."
  },
  {
    icon: CalendarCheck,
    title: "Escalas de Ministérios",
    description: "Gerencie escalas de forma transparente, notificando os envolvidos automaticamente."
  },
  {
    icon: Network,
    title: "Organograma da Igreja",
    description: "Conheça a estrutura e a liderança da sua comunidade de forma clara e visual."
  },
  {
    icon: Users,
    title: "Comunidade Conectada",
    description: "Mural de avisos, estudos da EBD, eventos e muito mais para manter todos informados."
  }
];

const Welcome = () => {
  const [index, setIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const dragControls = useRef(null);
  const navigate = useNavigate();

  const handleDragEnd = (event, info) => {
    const offset = info.offset.x;
    if (offset > 50 && index > 0) {
      setIndex(index - 1);
    } else if (offset < -50 && index < slides.length - 1) {
      setIndex(index + 1);
    }
  };

  const handleAccess = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setIsModalOpen(false);
    navigate('/login', { replace: true });
  };
  
  const CurrentIcon = slides[index].icon;

  return (
    <>
      <Helmet>
        <title>Bem-vindo ao Eclésia App</title>
      </Helmet>
      <div className="min-h-screen w-full flex flex-col items-center justify-between bg-gradient-to-br from-primary to-purple-600 dark:from-background dark:to-slate-900 p-6 overflow-hidden">
        
        <div className="mt-10 flex flex-col items-center text-center">
          <WelcomeLogo />
           <h1 className="text-4xl font-bold text-white mt-4">Eclésia App</h1>
        </div>

        <motion.div
          ref={dragControls}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          className="w-full max-w-md h-[350px] relative welcome-slider-container cursor-grab active:cursor-grabbing"
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={index}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center text-center text-white p-6 welcome-slide"
            >
              <motion.div 
                className="p-6 bg-white/20 rounded-full mb-8"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                <CurrentIcon className="w-16 h-16 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-4">{slides[index].title}</h2>
              <p className="text-lg text-white/80">{slides[index].description}</p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <div className="flex flex-col items-center w-full mb-10">
          <div className="flex justify-center gap-2 mb-8">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-3 h-3 rounded-full transition-all ${i === index ? 'bg-white scale-125' : 'bg-white/50'}`}
                aria-label={`Ir para slide ${i + 1}`}
              />
            ))}
          </div>

          {index === slides.length - 1 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Button size="lg" className="bg-white text-primary hover:bg-gray-200 shadow-lg" onClick={() => setIsModalOpen(true)}>
                Acessar Agora!
              </Button>
            </motion.div>
          ) : (
            <div className="h-14" />
          )}
        </div>
      </div>

      <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-center">
              Atenção: Versão <span className="text-red-500 font-extrabold">BETA</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base pt-2">
              O Eclésia App está em fase de testes. Você tem acesso antecipado a uma plataforma em desenvolvimento.
              <br/><br/>
              Durante este período, o uso é gratuito, mas erros podem ocorrer. Seu feedback é essencial!
              <br/><br/>
              Após esta fase, o app funcionará com planos de assinatura para sua contínua evolução.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center space-x-2 my-4 justify-center">
            <Checkbox id="terms" checked={termsAccepted} onCheckedChange={setTermsAccepted} />
            <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Eu li e aceito os <Link to="/terms-of-use" target="_blank" className="underline text-primary hover:text-primary/80">Termos de Uso</Link>.
            </label>
          </div>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleAccess} disabled={!termsAccepted} className="bg-primary hover:bg-primary/90">
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Welcome;