import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const TermsOfUse = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Termos de Uso - Eclésia App</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>

          <h1 className="text-4xl font-bold mb-6">Termos e Condições de Uso</h1>
          <div className="prose dark:prose-invert max-w-none space-y-4 text-muted-foreground">
            <p><strong>Última atualização:</strong> 20 de junho de 2025</p>
            
            <p>Bem-vindo ao Eclésia App! Estes termos e condições descrevem as regras e regulamentos para o uso do nosso aplicativo.</p>

            <h2 className="text-2xl font-semibold text-foreground">1. Aceitação dos Termos</h2>
            <p>Ao acessar e usar este aplicativo, você aceita e concorda em ficar vinculado pelos termos e disposições deste acordo. Além disso, ao usar estes serviços específicos, você estará sujeito a quaisquer diretrizes ou regras postadas aplicáveis a tais serviços. Qualquer participação neste serviço constituirá aceitação deste acordo. Se você não concordar em cumprir o acima, por favor, não use este serviço.</p>

            <h2 className="text-2xl font-semibold text-foreground">2. Fase BETA</h2>
            <p>Você reconhece que o Eclésia App está atualmente em sua fase BETA e é fornecido "como está" e "conforme disponível". O aplicativo pode conter bugs, erros e outros problemas. Nós não garantimos que o aplicativo será ininterrupto, oportuno, seguro ou livre de erros. Você concorda em nos fornecer feedback sobre sua experiência, o que pode incluir sugestões, relatórios de bugs e outras informações.</p>

            <h2 className="text-2xl font-semibold text-foreground">3. Planos de Assinatura Futuros</h2>
            <p>O acesso ao Eclésia App durante a fase BETA é gratuito. No entanto, reservamo-nos o direito de introduzir planos de assinatura pagos após o término do período BETA. Os usuários serão notificados com antecedência sobre quaisquer alterações nos preços e terão a opção de assinar um plano pago ou descontinuar o uso de determinados recursos.</p>

            <h2 className="text-2xl font-semibold text-foreground">4. Privacidade</h2>
            <p>Sua privacidade é importante para nós. Nossa Política de Privacidade, que é incorporada a estes Termos de Uso por referência, explica como coletamos, usamos e protegemos suas informações pessoais. Por favor, leia a Política de Privacidade cuidadosamente.</p>

            <h2 className="text-2xl font-semibold text-foreground">5. Conteúdo do Usuário</h2>
            <p>Você é o único responsável por todo o conteúdo que envia, posta ou exibe no ou através do aplicativo, incluindo, mas não se limitando a, informações de perfil, postagens no mural, músicas e liturgias ("Conteúdo do Usuário"). Você concede a nós uma licença mundial, não exclusiva, isenta de royalties para usar, copiar, reproduzir, processar, adaptar, modificar, publicar, transmitir, exibir e distribuir seu Conteúdo do Usuário em conexão com a prestação dos serviços do aplicativo.</p>
            
            <h2 className="text-2xl font-semibold text-foreground">6. Conduta do Usuário</h2>
            <p>Você concorda em não usar o serviço para: postar conteúdo ilegal, prejudicial, ameaçador, abusivo, difamatório ou obsceno; personificar qualquer pessoa ou entidade; ou violar qualquer lei local, estadual, nacional ou internacional.</p>

            <h2 className="text-2xl font-semibold text-foreground">7. Modificações nos Termos</h2>
            <p>Reservamo-nos o direito de modificar estes termos a qualquer momento. Iremos notificá-lo sobre quaisquer alterações, publicando os novos termos no aplicativo. Você é aconselhado a rever estes Termos periodicamente para quaisquer alterações. As alterações a estes Termos são eficazes quando são publicadas nesta página.</p>
            
            <h2 className="text-2xl font-semibold text-foreground">8. Contato</h2>
            <p>Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco através do nosso canal de suporte.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsOfUse;