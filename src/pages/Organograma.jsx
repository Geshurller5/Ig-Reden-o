import React, { useState, useEffect, useCallback, memo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Users2, Crown, Shield, Star, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ProfileModal from '@/components/organograma/ProfileModal';
import OrganogramaSkeleton from '@/components/organograma/OrganogramaSkeleton';

const roleDisplayNames = {
  Pastor: "Pastor",
  Pastora: "Pastora",
  Diacono: "Diácono",
  Diaconisa: "Diaconisa",
  "Lider de Ministerio": "Líder de Ministério",
  Membro: "Membro",
};

const MemberNode = memo(({ member, onNodeClick }) => {
  return (
    <motion.div
      onClick={() => onNodeClick(member)}
      className="flex flex-col items-center text-center p-3 rounded-lg w-40 cursor-pointer group"
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
      layout
    >
      <Avatar className="w-20 h-20 mb-3 border-4 border-transparent group-hover:border-primary transition-colors duration-300">
        <AvatarImage src={member.avatar} alt={`${member.name} ${member.surname}`} />
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
          {(member.name || ' ').charAt(0)}{(member.surname || ' ').charAt(0)}
        </AvatarFallback>
      </Avatar>
      <p className="font-bold text-sm leading-tight">{member.name} {member.surname}</p>
      {member.ministry && <p className="text-xs text-muted-foreground mt-1">{member.ministry}</p>}
    </motion.div>
  );
});

const Tier = ({ title, members, icon: Icon, onNodeClick, children }) => {
  if ((!members || members.length === 0) && !children) return null;

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-primary" />}
        <h2 className="text-xl font-bold text-primary">{title}</h2>
      </div>

      <div className="w-px h-6 bg-border mt-2" />

      {members && members.length > 0 && (
        <div className="relative w-full flex flex-col items-center">
          <div className="w-4/5 max-w-5xl h-px bg-border" />
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-12 pt-6">
            {members.map(member => (
              <div key={member.id} className="relative">
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-px h-6 bg-border" />
                <MemberNode member={member} onNodeClick={onNodeClick} />
              </div>
            ))}
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

const MinistryGroup = ({ ministry, members, onNodeClick }) => (
  <div className="relative flex flex-col items-center p-4 pt-8 mt-10 border border-dashed rounded-lg w-full">
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-px h-6 bg-border" />
    <h3 className="absolute -top-3 bg-background px-2 text-sm font-semibold text-primary">{ministry}</h3>
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
      {members.map(member => <MemberNode key={member.id} member={member} onNodeClick={onNodeClick} />)}
    </div>
  </div>
);

const Organograma = () => {
  const { toast } = useToast();
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);

  const buildTree = (profiles) => {
    const getCanonicalRole = (roleStr) => {
        const role = (roleStr || 'Membro').replace(/\s/g, '').toLowerCase();
        if (role.includes('pastor')) return 'Pastor';
        if (role.includes('pastora')) return 'Pastora';
        if (role.includes('diacono')) return 'Diacono';
        if (role.includes('diaconisa')) return 'Diaconisa';
        if (role.includes('lider') || role.includes('líder')) return 'Lider de Ministerio';
        return 'Membro';
    };

    const profilesWithDisplayRole = profiles.map(p => ({
        ...p,
        role_display: roleDisplayNames[p.role] || p.role
    }));

    const groupedByRole = profilesWithDisplayRole.reduce((acc, profile) => {
      const canonicalRole = getCanonicalRole(profile.role);
      if (!acc[canonicalRole]) acc[canonicalRole] = [];
      acc[canonicalRole].push(profile);
      return acc;
    }, {});
    
    const leadersByMinistry = (groupedByRole['Lider de Ministerio'] || []).reduce((acc, leader) => {
      const ministry = leader.ministry || 'Outros Ministérios';
      if (!acc[ministry]) acc[ministry] = [];
      acc[ministry].push(leader);
      return acc;
    }, {});

    return {
      pastores: [...(groupedByRole['Pastor'] || []), ...(groupedByRole['Pastora'] || [])],
      diaconos: [...(groupedByRole['Diacono'] || []), ...(groupedByRole['Diaconisa'] || [])],
      lideres: leadersByMinistry,
      membros: groupedByRole['Membro'] || [],
    };
  };

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
      toast({ title: 'Erro ao buscar membros', description: error.message, variant: 'destructive' });
      setTree({ pastores: [], diaconos: [], lideres: {}, membros: [] });
    } else {
      setTree(buildTree(data));
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  if (loading) {
    return <OrganogramaSkeleton />;
  }

  const hasContent = tree && (tree.pastores.length || tree.diaconos.length || Object.keys(tree.lideres).length || tree.membros.length);

  return (
    <>
      <Helmet><title>Organograma - Eclésia App</title></Helmet>
      <ProfileModal member={selectedMember} onClose={() => setSelectedMember(null)} />
      
      <div className="container mx-auto px-4 py-6 space-y-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center space-x-3">
            <Users2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold gradient-text">Organograma da Igreja</h1>
              <p className="text-muted-foreground">Visualize a estrutura de liderança e membros.</p>
            </div>
          </div>
        </motion.div>

        {hasContent ? (
            <motion.div 
              className="flex flex-col items-center gap-8"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
            >
              <Tier title="Pastorado" members={tree.pastores} icon={Crown} onNodeClick={setSelectedMember} />

              <Tier title="Diaconato" members={tree.diaconos} icon={Shield} onNodeClick={setSelectedMember} />
              
              {Object.keys(tree.lideres).length > 0 && (
                <Tier title="Líderes de Ministério" icon={Star}>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-0 w-full mt-4">
                        {Object.entries(tree.lideres).map(([ministry, members]) => (
                            <MinistryGroup key={ministry} ministry={ministry} members={members} onNodeClick={setSelectedMember} />
                        ))}
                    </div>
                </Tier>
              )}
              
              <Tier title="Membros" members={tree.membros} icon={User} onNodeClick={setSelectedMember} />
            </motion.div>
        ) : (
            <div className="text-center py-16">
                <p className="text-muted-foreground">Nenhum membro encontrado para exibir no organograma.</p>
            </div>
        )}
      </div>
    </>
  );
};

export default Organograma;