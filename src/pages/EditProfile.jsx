import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const EditProfile = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    surname: user?.surname || '',
    ministry: user?.ministry || '',
    bio: user?.bio || ''
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        Carregando perfil...
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await updateProfile(formData);
    
    if(error){
       toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
    } else {
       toast({
        title: 'Perfil atualizado!',
        description: 'Suas informações foram salvas com sucesso.',
      });
      navigate('/profile');
    }
  };

  return (
    <>
      <Helmet>
        <title>Editar Perfil - Eclésia App</title>
        <meta name="description" content="Edite suas informações de perfil." />
      </Helmet>
      <div className="container mx-auto max-w-2xl px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" onClick={() => navigate('/profile')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para o Perfil
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Editar Perfil</CardTitle>
              <CardDescription>
                Faça as alterações desejadas e clique em salvar.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Seu nome"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="surname">Sobrenome</Label>
                    <Input
                      id="surname"
                      name="surname"
                      value={formData.surname}
                      onChange={handleChange}
                      placeholder="Seu sobrenome"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ministry">Ministério Principal</Label>
                  <Input
                    id="ministry"
                    name="ministry"
                    value={formData.ministry}
                    onChange={handleChange}
                    placeholder="Ex: Louvor, Ação Social"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Fale um pouco sobre você..."
                    className="h-24"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => navigate('/profile')}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar Alterações</Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default EditProfile;