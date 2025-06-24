import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { QrCode, Copy, CheckCircle } from 'lucide-react';

const PixModal = ({ isOpen, onClose, amount, campaignTitle, pixKey }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen) {
    return null;
  }
  
  if (!pixKey) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>PIX Indisponível</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <p>A chave PIX não foi configurada pelo administrador.</p>
            <p className="text-sm text-muted-foreground">Por favor, contate o suporte.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    toast({ title: "Chave PIX copiada!", description: "Agora é só colar no seu app do banco." });
    setTimeout(() => setCopied(false), 2000);
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixKey)}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-6 w-6 text-primary" />
            Ofertar com PIX
          </DialogTitle>
          <DialogDescription>
            Para a campanha "{campaignTitle}" no valor de R$ {amount.toFixed(2)}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <div className="p-1 bg-gradient-to-br from-primary via-purple-500 to-pink-500 rounded-xl shadow-lg inline-block">
            <div className="p-3 bg-white rounded-lg">
              <div
                style={{
                  width: '200px',
                  height: '200px',
                  backgroundImage: `url(${qrCodeUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
                role="img"
                aria-label="QR Code para pagamento PIX"
              ></div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">Aponte a câmera do seu celular para o QR Code</p>
          <div className="w-full text-center">
            <p className="text-sm font-medium">Ou copie a chave PIX:</p>
            <div className="mt-2 flex w-full">
              <div className="flex-grow p-2 border rounded-l-md bg-muted text-xs break-all">
                {pixKey.substring(0, 40)}...
              </div>
              <Button onClick={handleCopy} className="rounded-l-none" size="icon" variant="outline">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={copied ? "check" : "copy"}
                    initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </motion.div>
                </AnimatePresence>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PixModal;