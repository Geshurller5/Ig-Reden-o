import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock, Mail, Church, Phone } from 'lucide-react';

const defaultItems = [
  {
    icon: <Lock className="h-5 w-5 text-primary" />,
    text: 'Todas as transações são seguras e criptografadas.',
  },
  {
    icon: <Mail className="h-5 w-5 text-primary" />,
    text: 'Você receberá um comprovante por e-mail (simulado).',
  },
  {
    icon: <Church className="h-5 w-5 text-primary" />,
    text: 'As ofertas são usadas para manter a igreja e seus ministérios.',
  },
  {
    icon: <Phone className="h-5 w-5 text-primary" />,
    text: 'Em caso de dúvidas, contate a tesouraria.',
  },
];

const InfoBlock = ({ infoItems = defaultItems }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="max-w-lg mx-auto"
    >
      <Card className="rounded-xl bg-muted/50 shadow-md">
        <CardHeader>
          <CardTitle>Informações Importantes</CardTitle>
          <CardDescription>Transparência e segurança nas contribuições.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {infoItems.map((item, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">{item.icon}</div>
                <p className="text-muted-foreground">{item.text}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default InfoBlock;