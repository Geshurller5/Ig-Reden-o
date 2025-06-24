import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { Hand as HeartHand, Landmark, Wallet, CreditCard, DollarSign, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';

const GerenciarOfertas = () => {
  const { toast } = useToast();
  const [pixKey, setPixKey] = useState('');
  const [donations, setDonations] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [totals, setTotals] = useState({ total: 0, pix: 0, card: 0, wallet: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Fetch config
      const { data: configData } = await supabase.from('app_config').select('value').eq('key', 'offering').single();
      if (configData) setPixKey(configData.value.pix_key || '');

      // Fetch offerings
      const { data: offeringsData, error } = await supabase.from('offerings').select('*, profile:profiles(name, surname)').order('created_at', { ascending: false });
      
      if (!error) {
        setDonations(offeringsData);
        
        const total = offeringsData.reduce((acc, d) => acc + Number(d.amount), 0);
        const pix = offeringsData.filter(d => d.method === 'Pix').reduce((acc, d) => acc + Number(d.amount), 0);
        const card = offeringsData.filter(d => d.method === 'Cartão').reduce((acc, d) => acc + Number(d.amount), 0);
        const wallet = offeringsData.filter(d => d.method === 'Carteira Digital').reduce((acc, d) => acc + Number(d.amount), 0);
        setTotals({ total, pix, card, wallet });

        const monthlyData = offeringsData.reduce((acc, d) => {
            const month = new Date(d.created_at).toLocaleString('default', { month: 'short' });
            acc[month] = (acc[month] || 0) + Number(d.amount);
            return acc;
        }, {});

        setChartData(Object.keys(monthlyData).map(key => ({ name: key, Ofertas: monthlyData[key] })));
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSavePixKey = async () => {
    const { error } = await supabase.from('app_config').update({ value: { pix_key: pixKey } }).eq('key', 'offering');
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: 'destructive' });
    } else {
      toast({ title: "Configuração salva!", description: "A chave PIX foi atualizada com sucesso.", action: <Save className="h-5 w-5 text-green-500" /> });
    }
  };
  
  const getMethodIcon = (method) => {
    switch (method) {
      case "Pix": return <Landmark className="h-4 w-4" />;
      case "Carteira Digital": return <Wallet className="h-4 w-4" />;
      case "Cartão": return <CreditCard className="h-4 w-4" />;
      default: return null;
    }
  };
  
  const getMethodColor = (method) => {
    switch (method) {
      case "Pix": return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case "Carteira Digital": return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case "Cartão": return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Helmet><title>Gerenciar Ofertas - Eclésia App</title></Helmet>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center space-x-2">
          <HeartHand className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold gradient-text">Gerenciar Ofertas</h1>
            <p className="text-muted-foreground">Visualize doações e relatórios financeiros.</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Total Arrecadado", value: totals.total, icon: DollarSign },
            { title: "Pix", value: totals.pix, icon: Landmark },
            { title: "Cartão", value: totals.card, icon: CreditCard },
            { title: "Carteira Digital", value: totals.wallet, icon: Wallet },
          ].map((item, index) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.05 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {item.value.toFixed(2)}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <motion.div className="lg:col-span-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader><CardTitle>Arrecadação Mensal</CardTitle></CardHeader>
              <CardContent>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value/1000}k`} />
                      <Tooltip wrapperClassName="!bg-background !border-border" cursor={{fill: 'hsl(var(--muted))'}} />
                      <Bar dataKey="Ofertas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardHeader><CardTitle>Doações Recentes</CardTitle><CardDescription>Últimas doações recebidas.</CardDescription></CardHeader>
              <CardContent className="space-y-4 max-h-80 overflow-y-auto">
                {donations.map(donation => (
                  <div key={donation.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{donation.profile?.name || 'Anônimo'}</p>
                      <p className="text-sm text-muted-foreground">{new Date(donation.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">R$ {Number(donation.amount).toFixed(2)}</p>
                      <Badge variant="outline" className={getMethodColor(donation.method)}>{getMethodIcon(donation.method)}<span className="ml-1">{donation.method}</span></Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Oferta</CardTitle>
              <CardDescription>Configure os métodos de pagamento disponíveis no aplicativo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pix-key">Chave PIX</Label>
                <Input id="pix-key" value={pixKey} onChange={(e) => setPixKey(e.target.value)} placeholder="Insira sua chave PIX (CPF, CNPJ, e-mail, etc.)" />
              </div>
              <Button onClick={handleSavePixKey} disabled={loading}><Save className="mr-2 h-4 w-4" /> Salvar Chave PIX</Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default GerenciarOfertas;