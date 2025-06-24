import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, UserCog, Search } from 'lucide-react';

// Opções de funções disponíveis
const roleOptions = [
    { value: "Pastor", label: "Pastor" },
    { value: "Pastora", label: "Pastora" },
    { value: "Diacono", label: "Diácono" },
    { value: "Diaconisa", label: "Diaconisa" },
    { value: "Lider de Ministerio", label: "Líder de Ministério" },
    { value: "Membro", label: "Membro" },
];

// Nomes de exibição para as funções
const roleDisplayNames = {
    "Pastor": "Pastor",
    "Pastora": "Pastora", 
    "Diacono": "Diácono",
    "Diaconisa": "Diaconisa",
    "Lider de Ministerio": "Líder de Ministério",
    "Membro": "Membro"
};

// Componente para uma linha de membro na tabela
const MemberRow = ({ member, onSave, currentUser }) => {
    const [role, setRole] = useState(member.role || 'Membro');
    const [ministry, setMinistry] = useState(member.ministry || '');
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const isLeader = role === 'Lider de Ministerio';
    // Verifica se houve alguma alteração nos campos
    const hasChanges = role !== member.role || (isLeader && ministry !== (member.ministry || ''));

    // Função para criar uma notificação de mudança de função
    const createRoleChangeNotification = async (memberId, newRole, adminName) => {
        const roleDisplay = roleDisplayNames[newRole] || newRole;
        await supabase.from('notifications').insert({
            user_id: memberId,
            title: `Nova Função Atribuída!`,
            message: `Você foi designado(a) como ${roleDisplay} por ${adminName}. Clique para ver seu perfil.`,
            link: '/profile',
            is_read: false
        });
    };

    // Lida com a ação de salvar as alterações de um membro
    const handleSave = async () => {
        if (!hasChanges) return; // Não faz nada se não houver mudanças
        
        setIsSaving(true);
        const updateData = {
            role,
            ministry: isLeader ? ministry : null, // Define ministério como null se não for líder
        };

        const { error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', member.id);

        if (error) {
            toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Sucesso!', description: `Função de ${member.name} atualizada com sucesso.` });
            
            // Cria notificação se a função foi alterada
            if (role !== member.role) {
                await createRoleChangeNotification(
                    member.id, 
                    role, 
                    `${currentUser.name} ${currentUser.surname}`
                );
            }
            
            onSave({ ...member, ...updateData }); // Atualiza o estado na lista principal
        }
        setIsSaving(false);
    };

    return (
        <TableRow className="hover:bg-muted/50 transition-colors flex flex-col md:table-row border-b md:border-none">
            {/* Informações do Membro */}
            <TableCell className="py-3 px-4 md:py-2 md:px-6">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {(member.name || ' ').charAt(0)}{(member.surname || ' ').charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium">{member.name} {member.surname}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                </div>
            </TableCell>
            
            {/* Seleção de Função */}
            <TableCell className="py-3 px-4 md:py-2 md:px-6">
                <div className="flex items-center justify-between md:block">
                    <span className="font-semibold md:hidden">Função:</span>
                    <Select value={role} onValueChange={setRole}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Selecione a função" />
                        </SelectTrigger>
                        <SelectContent>
                            {roleOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </TableCell>

            {/* Campo de Ministério */}
            <TableCell className="py-3 px-4 md:py-2 md:px-6">
                <div className="flex items-center justify-between md:block">
                    <span className="font-semibold md:hidden">Ministério:</span>
                    <Input 
                        value={ministry}
                        onChange={(e) => setMinistry(e.target.value)}
                        disabled={!isLeader}
                        placeholder={isLeader ? "Ex: Louvor, Jovens, Crianças" : "Não aplicável"}
                        className={`w-full ${!isLeader ? "bg-muted" : ""}`}
                    />
                </div>
            </TableCell>
            
            {/* Botão de Ação */}
            <TableCell className="py-3 px-4 md:py-2 md:px-6 text-right md:text-left">
                <Button 
                    onClick={handleSave} 
                    disabled={isSaving || !hasChanges} 
                    size="sm"
                    className={`w-full md:w-auto ${hasChanges ? "bg-primary" : ""}`}
                >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
                </Button>
            </TableCell>
        </TableRow>
    );
};

// Componente principal da página de Gerenciamento de Organograma
const GerenciarOrganograma = () => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();
    const { user } = useAuth(); // Usuário atualmente logado para notificações

    // Busca os perfis no Supabase
    const fetchProfiles = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('profiles').select('*').order('name', { ascending: true });
        if (error) {
            toast({ title: 'Erro ao buscar perfis', description: error.message, variant: 'destructive' });
        } else {
            setProfiles(data);
        }
        setLoading(false);
    }, [toast]); // Dependência do toast para useCallback

    // Efeito para buscar perfis ao montar o componente
    useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles]); // Dependência do fetchProfiles

    // Atualiza um membro na lista de perfis após salvar
    const handleSave = (updatedMember) => {
        setProfiles(prev => prev.map(p => p.id === updatedMember.id ? updatedMember : p));
    };

    // Filtra os perfis com base no termo de busca
    const filteredProfiles = useMemo(() => {
        if (!searchTerm) return profiles;
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return profiles.filter(p => 
            `${p.name || ''} ${p.surname || ''}`.toLowerCase().includes(lowerCaseSearchTerm) ||
            (p.role || '').toLowerCase().includes(lowerCaseSearchTerm) ||
            (p.ministry || '').toLowerCase().includes(lowerCaseSearchTerm)
        );
    }, [profiles, searchTerm]); // Dependências para useMemo

    // Calcula estatísticas sobre as funções dos membros
    const stats = useMemo(() => {
        const roleCount = profiles.reduce((acc, profile) => {
            const role = profile.role || 'Membro';
            acc[role] = (acc[role] || 0) + 1;
            return acc;
        }, {});
        
        return {
            total: profiles.length,
            pastores: (roleCount['Pastor'] || 0) + (roleCount['Pastora'] || 0),
            diaconos: (roleCount['Diacono'] || 0) + (roleCount['Diaconisa'] || 0),
            lideres: roleCount['Lider de Ministerio'] || 0,
            membros: roleCount['Membro'] || 0
        };
    }, [profiles]); // Dependência para useMemo

    return (
        <>
            <Helmet><title>Gestão de Organograma - Eclésia App</title></Helmet>
            <div className="container mx-auto px-4 py-6 space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-3 mb-6">
                        <UserCog className="h-8 w-8 text-primary" />
                        <div>
                            <h1 className="text-3xl font-bold gradient-text">Gestão de Organograma</h1>
                            <p className="text-muted-foreground text-sm md:text-base">Defina funções e ministérios para cada membro da igreja.</p>
                        </div>
                    </div>
                </motion.div>

                {/* Seção de Estatísticas */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6"
                >
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-primary">{stats.total}</p>
                            <p className="text-sm text-muted-foreground">Total de Membros</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-purple-600">{stats.pastores}</p>
                            <p className="text-sm text-muted-foreground">Pastores</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-blue-600">{stats.diaconos}</p>
                            <p className="text-sm text-muted-foreground">Diáconos</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-green-600">{stats.lideres}</p>
                            <p className="text-sm text-muted-foreground">Líderes</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-2xl font-bold text-gray-600">{stats.membros}</p>
                            <p className="text-sm text-muted-foreground">Membros</p>
                        </CardContent>
                    </Card>
                </motion.div>
                
                {/* Seção da Tabela de Membros */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card>
                        <CardHeader className="flex flex-col md:flex-row md:justify-between md:items-center space-y-2 md:space-y-0">
                            <CardTitle className="flex items-center gap-2">
                                <UserCog className="h-5 w-5" />
                                Membros da Igreja
                            </CardTitle>
                            <div className="relative w-full md:w-auto">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Buscar por nome, função ou ministério..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-full max-w-full md:max-w-sm"
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center items-center py-10">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : (
                                <div className="rounded-md border overflow-x-auto"> {/* Adicionado overflow-x-auto para rolagem horizontal em telas pequenas */}
                                    <Table className="min-w-full md:min-w-0"> {/* min-w-full para garantir que a tabela ocupe o espaço necessário para rolagem */}
                                        <TableHeader className="hidden md:table-header-group"> {/* Oculta o cabeçalho em mobile */}
                                            <TableRow>
                                                <TableHead className="w-[300px]">Membro</TableHead>
                                                <TableHead>Função</TableHead>
                                                <TableHead>Ministério</TableHead>
                                                <TableHead className="text-right">Ação</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredProfiles.length > 0 ? (
                                                filteredProfiles.map(member => (
                                                    <MemberRow 
                                                        key={member.id} 
                                                        member={member} 
                                                        onSave={handleSave}
                                                        currentUser={user}
                                                    />
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="h-24 text-center">
                                                        {searchTerm ? 'Nenhum membro encontrado com esse termo.' : 'Nenhum membro encontrado.'}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </>
    )
}

export default GerenciarOrganograma;