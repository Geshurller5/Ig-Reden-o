import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Hand as HeartHand, Landmark, Wallet, CreditCard, DollarSign } from 'lucide-react';
import InfoBlock from '@/components/common/InfoBlock';
import PixModal from '@/components/modals/PixModal';
import DigitalWalletModal from '@/components/modals/DigitalWalletModal';
import CreditCardModal from '@/components/modals/CreditCardModal';

const Offering = () => {
  const [amount, setAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Pix');
  const [activeModal, setActiveModal] = useState(null);
  const [pixKey, setPixKey] = useState('');

  useEffect(() => {
    const key = localStorage.getItem('eclesia-pix-key');
    if (key) {
        setPixKey(key);
    }
  }, []);

  const predefinedAmounts = [20, 50, 100, 200];
  const paymentMethods = [
    { name: 'Pix', icon: Landmark, modal: 'pix' },
    { name: 'Cartão de Crédito', icon: CreditCard, modal: 'card' },
    { name: 'Carteira Digital', icon: Wallet, modal: 'wallet' },
  ];

  const handleAmountClick = (value) => {
    setAmount(value);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setCustomAmount(value);
      setAmount(Number(value) || 0);
    }
  };

  const handleContributeClick = () => {
    const selectedMethod = paymentMethods.find(p => p.name === paymentMethod);
    if (selectedMethod) {
      setActiveModal(selectedMethod.modal);
    }
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <>
      <Helmet>
        <title>Ofertar - Eclésia App</title>
        <meta name="description" content="Contribua com a obra fazendo sua oferta de forma segura e transparente." />
      </Helmet>
      <div className="container mx-auto px-4 py-6 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <div className="inline-flex items-center justify-center space-x-2">
            <HeartHand className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold gradient-text">Faça sua Oferta</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Sua contribuição sustenta os ministérios e a expansão da nossa comunidade de fé.
            "Cada um contribua segundo propôs no seu coração; não com tristeza, ou por necessidade; porque Deus ama ao que dá com alegria." - 2 Coríntios 9:7
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="max-w-2xl mx-auto glass-effect">
            <CardHeader>
              <CardTitle>Selecione o Valor</CardTitle>
              <CardDescription>Escolha um valor ou digite uma quantia personalizada.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {predefinedAmounts.map((value) => (
                    <Button
                      key={value}
                      type="button"
                      variant={amount === value && !customAmount ? 'default' : 'outline'}
                      onClick={() => handleAmountClick(value)}
                      className="h-16 text-lg"
                    >
                      R$ {value}
                    </Button>
                  ))}
                </div>

                <div>
                  <Label htmlFor="custom-amount">Ou digite outro valor (R$)</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="custom-amount"
                      type="text"
                      inputMode="decimal"
                      placeholder="Ex: 35.50"
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                      className="pl-9 text-lg"
                    />
                  </div>
                </div>

                <div>
                  <Label>Forma de Pagamento</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                    {paymentMethods.map(({ name, icon: Icon }) => (
                      <Button
                        key={name}
                        type="button"
                        variant={paymentMethod === name ? 'default' : 'outline'}
                        onClick={() => setPaymentMethod(name)}
                        className="justify-start h-12"
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {name}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button type="button" size="lg" className="w-full text-lg" onClick={handleContributeClick} disabled={amount <= 0}>
                  Contribuir com R$ {amount > 0 ? amount.toFixed(2) : '0.00'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <InfoBlock />
      </div>

      <PixModal
        isOpen={activeModal === 'pix'}
        onClose={closeModal}
        amount={amount}
        campaignTitle="Oferta Especial"
        pixKey={pixKey}
      />
      <DigitalWalletModal
        isOpen={activeModal === 'wallet'}
        onClose={closeModal}
        amount={amount}
        campaignTitle="Oferta Especial"
      />
      <CreditCardModal
        isOpen={activeModal === 'card'}
        onClose={closeModal}
        amount={amount}
        campaignTitle="Oferta Especial"
      />
    </>
  );
};

export default Offering;