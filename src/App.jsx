
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import AdminLayout from '@/layouts/AdminLayout';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Profile from '@/pages/Profile';
import EditProfile from '@/pages/EditProfile';
import Liturgia from '@/pages/Liturgia';
import Repertorio from '@/pages/Repertorio';
import PlaylistDetail from '@/pages/PlaylistDetail';
import Escalas from '@/pages/Escalas';
import Eventos from '@/pages/Eventos';
import Biblia from '@/pages/Biblia';
import EBD from '@/pages/EBD';
import Mural from '@/pages/Mural';
import Organograma from '@/pages/Organograma';
import Admin from '@/pages/Admin';
import CriarEscala from '@/pages/admin/CriarEscala';
import GerenciarEscalas from '@/pages/admin/GerenciarEscalas';
import GerenciarLiturgia from '@/pages/admin/GerenciarLiturgia';
import DetalhesLiturgia from '@/pages/admin/DetalhesLiturgia';
import GerenciarRepertorio from '@/pages/admin/GerenciarRepertorio';
import GerenciarEBD from '@/pages/admin/GerenciarEBD';
import GerenciarNotificacoes from '@/pages/admin/GerenciarNotificacoes';
import GerenciarOfertas from '@/pages/admin/GerenciarOfertas';
import GerenciarEventos from '@/pages/admin/GerenciarEventos';
import GerenciarOrganograma from '@/pages/admin/GerenciarOrganograma';
import AdminStudio from '@/pages/admin/Studio';
import Offering from '@/pages/Offering';
import Welcome from '@/pages/Welcome';
import TermsOfUse from '@/pages/TermsOfUse';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }
  const allowedRoles = ['admin', 'pastor'];
  return user && allowedRoles.includes(user.role) ? children : <Navigate to="/" replace />;
};

const MainAppLayout = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/profile/edit" element={<EditProfile />} />
      <Route path="/liturgia" element={<Liturgia />} />
      <Route path="/repertorio" element={<Repertorio />} />
      <Route path="/repertorio/playlists/:id" element={<PlaylistDetail />} />
      <Route path="/escalas" element={<Escalas />} />
      <Route path="/eventos" element={<Eventos />} />
      <Route path="/biblia" element={<Biblia />} />
      <Route path="/ebd" element={<EBD />} />
      <Route path="/mural" element={<Mural />} />
      <Route path="/ofertar" element={<Offering />} />
      <Route path="/organograma" element={<Organograma />} />
    </Routes>
  </Layout>
);

const AppRoutes = () => {
  const hasSeenWelcome = localStorage.getItem('hasSeenWelcome') === 'true';
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <Routes>
      <Route path="/welcome" element={hasSeenWelcome ? <Navigate to="/login" replace /> : <Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/terms-of-use" element={<TermsOfUse />} />

      <Route path="/admin/*" element={
        <AdminRoute>
          <AdminLayout>
            <Routes>
              <Route path="/" element={<Admin />} />
              <Route path="/criar-escala" element={<CriarEscala />} />
              <Route path="/editar-escala/:id" element={<CriarEscala />} />
              <Route path="/gerenciar-escalas" element={<GerenciarEscalas />} />
              <Route path="/gerenciar-liturgia" element={<GerenciarLiturgia />} />
              <Route path="/gerenciar-liturgia/:id" element={<DetalhesLiturgia />} />
              <Route path="/gerenciar-repertorio" element={<GerenciarRepertorio />} />
              <Route path="/gerenciar-organograma" element={<GerenciarOrganograma />} />
              <Route path="/gerenciar-ebd" element={<GerenciarEBD />} />
              <Route path="/gerenciar-notificacoes" element={<GerenciarNotificacoes />} />
              <Route path="/gerenciar-ofertas" element={<GerenciarOfertas />} />
              <Route path="/gerenciar-eventos" element={<GerenciarEventos />} />
              <Route path="/studio" element={<AdminStudio />} />
            </Routes>
          </AdminLayout>
        </AdminRoute>
      } />
      
      {user ? (
        <Route path="/*" element={<MainAppLayout />} />
      ) : (
        <Route path="*" element={<Navigate to={hasSeenWelcome ? "/login" : "/welcome"} replace />} />
      )}
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Helmet>
            <title>Eclésia App - Gestão e Comunhão de Igrejas</title>
            <meta name="description" content="App completo para gestão e comunhão de igrejas com liturgia, repertório, escalas, EBD e muito mais." />
          </Helmet>
          <div className="min-h-screen bg-background text-foreground transition-colors duration-300 scrollbar-hide">
            <AppRoutes />
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
