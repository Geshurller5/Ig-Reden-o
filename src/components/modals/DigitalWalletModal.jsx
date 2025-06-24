import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Wallet } from 'lucide-react';

const DigitalWalletModal = ({ isOpen, onClose, amount, campaignTitle }) => {
  const { toast } = useToast();
  const [selectedWallet, setSelectedWallet] = useState('');
  const [error, setError] = useState('');

  const wallets = ["MercadoPago", "PicPay", "PayPal", "Ame Digital"];

  const handleSubmit = () => {
    if (!selectedWallet) {
      setError('Por favor, selecione uma carteira digital.');
      return;
    }
    setError('');
    
    toast({
      title: "Pagamento Aprovado!",
      description: `Sua oferta de R$ ${amount.toFixed(2)} com ${selectedWallet} foi recebida.`,
    });
    
    setTimeout(() => {
      onClose();
      setSelectedWallet('');
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); setError(''); setSelectedWallet(''); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            Ofertar com Carteira Digital
          </DialogTitle>
          <DialogDescription>
            Para a campanha "{campaignTitle}" no valor de R$ {amount.toFixed(2)}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <Select onValueChange={setSelectedWallet} value={selectedWallet}>
            <SelectTrigger className={error ? 'border-destructive' : ''}>
              <SelectValue placeholder="Selecione a carteira" />
            </SelectTrigger>
            <SelectContent>
              {wallets.map(wallet => (
                <SelectItem key={wallet} value={wallet}>{wallet}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button 
            onClick={handleSubmit} 
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity"
          >
            Confirmar Pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DigitalWalletModal;