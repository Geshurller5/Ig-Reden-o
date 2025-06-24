import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { CreditCard } from 'lucide-react';

const CreditCardModal = ({ isOpen, onClose, amount, campaignTitle }) => {
  const { toast } = useToast();
  const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCardData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!cardData.number || cardData.number.length < 16) newErrors.number = 'Número do cartão inválido.';
    if (!cardData.name) newErrors.name = 'Nome do titular é obrigatório.';
    if (!cardData.expiry.match(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)) newErrors.expiry = 'Validade inválida (MM/AA).';
    if (!cardData.cvv || cardData.cvv.length < 3) newErrors.cvv = 'CVV inválido.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const isSuccess = Math.random() > 0.2; // 80% chance of success

    if (isSuccess) {
      toast({
        title: "Pagamento Aprovado!",
        description: `Sua oferta de R$ ${amount.toFixed(2)} com o cartão final ${cardData.number.slice(-4)} foi recebida.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Pagamento Recusado",
        description: "Não foi possível processar seu pagamento. Tente novamente.",
      });
    }

    setTimeout(() => {
      onClose();
      setCardData({ number: '', name: '', expiry: '', cvv: '' });
      setErrors({});
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); setErrors({}); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            Ofertar com Cartão de Crédito
          </DialogTitle>
          <DialogDescription>
            Para a campanha "{campaignTitle}" no valor de R$ {amount.toFixed(2)}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <Label htmlFor="number">Número do Cartão</Label>
            <Input id="number" name="number" value={cardData.number} onChange={handleChange} maxLength="16" className={errors.number ? 'border-destructive' : ''} />
            {errors.number && <p className="text-sm text-destructive mt-1">{errors.number}</p>}
          </div>
          <div>
            <Label htmlFor="name">Nome do Titular</Label>
            <Input id="name" name="name" value={cardData.name} onChange={handleChange} className={errors.name ? 'border-destructive' : ''} />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiry">Validade (MM/AA)</Label>
              <Input id="expiry" name="expiry" placeholder="MM/AA" value={cardData.expiry} onChange={handleChange} maxLength="5" className={errors.expiry ? 'border-destructive' : ''} />
              {errors.expiry && <p className="text-sm text-destructive mt-1">{errors.expiry}</p>}
            </div>
            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input id="cvv" name="cvv" value={cardData.cvv} onChange={handleChange} maxLength="4" className={errors.cvv ? 'border-destructive' : ''} />
              {errors.cvv && <p className="text-sm text-destructive mt-1">{errors.cvv}</p>}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleSubmit} 
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90 transition-opacity"
          >
            Pagar com Segurança
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreditCardModal;