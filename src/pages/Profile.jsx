import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { Edit, Camera, MessageSquare, CalendarDays, Music, GraduationCap, Heart } from 'lucide-react';
import AvatarSelectionModal from '@/components/profile/AvatarSelectionModal';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  const handleAvatarSelect = async (avatarUrl) => {
    const { error } = await updateProfile({ avatar: avatarUrl });
    if (error) {
       toast({
        title: "Erro ao atualizar o avatar.",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Avatar atualizado!",
        description: "Sua nova foto de perfil foi salva.",
      });
    }
  };
  
  const StatItem = ({ value, label }) => (
    <div className="text-center">
      <p className="font-bold text-lg">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );

  const quickAccess = [
    { title: "Mural de Avisos", path: "/mural", icon: MessageSquare },
    { title: "Estudos da EBD", path: "/ebd", icon: GraduationCap },
    { title: "Ofertar", path: "/ofertar", icon: Heart },
    { title: "Escalas", path: "/escalas", icon: CalendarDays },
    { title: "Repertório", path: "/repertorio", icon: Music },
  ];

  return (
    <>
      <Helmet>
        <title>Perfil de {user?.name} - Eclésia App</title>
        <meta name="description" content={`Perfil de ${user?.name} no Eclésia App.`} />
      </Helmet>
      
      <AvatarSelectionModal 
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onAvatarSelect={handleAvatarSelect}
      />

      <div className="container mx-auto max-w-4xl px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start">
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-24 w-24 md:h-36 md:w-36 border-4 border-background shadow-md">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-4xl">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-md"
                      onClick={() => setIsAvatarModalOpen(true)}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="mt-4 sm:mt-0 sm:ml-8 flex-grow">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-bold">{user?.name} {user?.surname}</h1>
                        <p className="text-md text-muted-foreground font-medium">{user?.ministry}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleEditProfile}>
                        <Edit className="h-3 w-3 sm:mr-2" />
                        <span className="hidden sm:inline">Editar Perfil</span>
                      </Button>
                    </div>

                    <div className="mt-4 flex justify-center sm:justify-start border-t pt-4">
                      <StatItem value={user?.role === 'admin' ? 'Admin' : 'Membro'} label="Nível" />
                    </div>
                    
                    <div className="mt-4">
                      <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider">Bio</h3>
                      <p className="text-sm text-foreground/90 mt-1 italic">
                        "{user?.bio || 'Edite seu perfil para adicionar uma bio.'}"
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Acesso Rápido</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {quickAccess.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <li key={index}>
                        <a
                          href={item.path}
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(item.path);
                          }}
                          className="flex items-center p-3 -m-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                        >
                          <Icon className="h-6 w-6 mr-4 text-primary" />
                          <span className="font-medium">{item.title}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Profile;