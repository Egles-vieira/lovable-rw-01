// src/pages/legal/TermsAndPrivacy.jsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Shield, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsAndPrivacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Termos e Política de Privacidade
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Sistema Road RW - Conformidade com a LGPD
          </p>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Imprimir
          </Button>
        </div>

        <div className="grid gap-6">
          {/* Política de Privacidade */}
          <Card className="print:break-inside-avoid">
            <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Shield className="w-5 h-5" />
                Política de Privacidade
              </CardTitle>
              <CardDescription>
                Conforme Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ScrollArea className="h-96 pr-4">
                <div className="space-y-6 text-sm text-gray-700 dark:text-gray-300">
                  <Section title="1. Identificação da Empresa">
                    <p><strong>ROAD SISTEMAS LTDA - EPP</strong></p>
                    <p>CNPJ: 51.239.793/0001-37</p>
                    <p>Nome Fantasia: ROAD WEB</p>
                    <p>Endereço: AV MARCOS PENTEADO DE ULHOA RODRIGUES 690, GALPAO 03, Tamboré, Barueri/SP</p>
                    <p>CEP: 06460-040 | Data de Fundação: 29/06/2023</p>
                  </Section>

                  <Section title="2. Dados Coletados">
                    <ul className="list-disc list-inside space-y-2">
                      <li><strong>Dados Pessoais:</strong> Nome, CPF, e-mail, telefone, cargo</li>
                      <li><strong>Dados Empresariais:</strong> CNPJ, razão social, endereço comercial</li>
                      <li><strong>Dados Operacionais:</strong> Transportadoras, clientes, notas fiscais</li>
                    </ul>
                  </Section>

                  <Section title="3. Finalidades do Tratamento">
                    <ul className="list-disc list-inside space-y-2">
                      <li>Gestão logística integrada</li>
                      <li>Emissão de relatórios e analytics</li>
                      <li>Comunicação com usuários</li>
                      <li>Melhoria contínua do sistema</li>
                      <li>Cumprimento de obrigações legais</li>
                    </ul>
                  </Section>

                  <Section title="4. Direitos do Titular">
                    <div className="grid gap-3">
                      <RightItem text="Confirmação da existência de tratamento" />
                      <RightItem text="Acesso aos dados" />
                      <RightItem text="Correção de dados incompletos" />
                      <RightItem text="Eliminação de dados desnecessários" />
                      <RightItem text="Portabilidade dos dados" />
                      <RightItem text="Revogação do consentimento" />
                    </div>
                  </Section>

                  <Section title="5. Segurança dos Dados">
                    <ul className="list-disc list-inside space-y-2">
                      <li>Criptografia de dados sensíveis</li>
                      <li>Controle de acesso baseado em roles</li>
                      <li>Backup regular</li>
                      <li>Monitoramento de segurança</li>
                    </ul>
                  </Section>

                  <Section title="6. Contato do Encarregado (DPO)">
                    <p><strong>Encarregado de Proteção de Dados</strong></p>
                    <p>E-mail: dpo@roadweb.com.br</p>
                    <p>Telefone: (11) XXXX-XXXX</p>
                  </Section>

                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-8">
                    <p><strong>Última atualização:</strong> 24/09/2024</p>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Termos e Condições */}
          <Card className="print:break-inside-avoid">
            <CardHeader className="bg-green-50 dark:bg-green-900/20">
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <FileText className="w-5 h-5" />
                Termos e Condições de Uso
              </CardTitle>
              <CardDescription>
                Condições gerais de uso do Sistema Road RW
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ScrollArea className="h-96 pr-4">
                <div className="space-y-6 text-sm text-gray-700 dark:text-gray-300">
                  <Section title="1. Aceitação dos Termos">
                    <p>Ao acessar e utilizar o Sistema Road RW, o usuário declara estar ciente e concordar integralmente com estes Termos e Condições.</p>
                  </Section>

                  <Section title="2. Objeto do Serviço">
                    <p>O Sistema Road RW é uma plataforma de gestão logística que oferece:</p>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      <li>Controle de transportadoras</li>
                      <li>Gestão de clientes</li>
                      <li>Administração de notas fiscais</li>
                      <li>Rastreamento de romaneios</li>
                      <li>Registro de ocorrências</li>
                      <li>Relatórios analíticos</li>
                    </ul>
                  </Section>

                  <Section title="3. Cadastro e Conta">
                    <h4 className="font-semibold mt-3">Requisitos:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Ser pessoa jurídica regularmente constituída</li>
                      <li>Fornecer informações verídicas e atualizadas</li>
                      <li>Designar usuários autorizados</li>
                    </ul>

                    <h4 className="font-semibold mt-3">Responsabilidades:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Manter confidenciais os dados de acesso</li>
                      <li>Notificar uso não autorizado imediatamente</li>
                      <li>Responsabilizar-se por atividades na conta</li>
                    </ul>
                  </Section>

                  <Section title="4. Obrigações do Usuário">
                    <h4 className="font-semibold mt-3">Condutas Permitidas:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Uso empresarial legítimo</li>
                      <li>Backup próprio dos dados</li>
                      <li>Compliance com leis aplicáveis</li>
                    </ul>

                    <h4 className="font-semibold mt-3">Condutas Vedadas:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Acesso não autorizado a sistemas</li>
                      <li>Violação de propriedade intelectual</li>
                      <li>Uso para atividades ilícitas</li>
                    </ul>
                  </Section>

                  <Section title="5. Limitação de Responsabilidade">
                    <p>O sistema é fornecido "no estado em que se encontra", com disponibilidade alvo de 99,5%, exceto em casos de manutenção programada ou força maior.</p>
                  </Section>

                  <Section title="6. Contato">
                    <p><strong>ROAD SISTEMAS LTDA - EPP</strong></p>
                    <p>E-mail: contato@roadweb.com.br</p>
                    <p>Telefone: (11) XXXX-XXXX</p>
                    <p>Horário: Segunda a sexta, 9h às 18h</p>
                  </Section>

                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-8">
                    <p><strong>Documentos válidos a partir de:</strong> 24/09/2024</p>
                    <p><strong>Versão:</strong> 1.0</p>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Consentimento */}
          <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
                  Consentimento e Aceitação
                </h3>
                <p className="text-amber-700 dark:text-amber-300 text-sm">
                  Ao utilizar o Sistema Road RW, você concorda com os termos aqui estabelecidos.
                  Em caso de dúvidas, entre em contato com nosso encarregado de proteção de dados.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Componente auxiliar para seções
const Section = ({ title, children }) => (
  <section>
    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
    <div className="text-gray-700 dark:text-gray-300">
      {children}
    </div>
  </section>
);

// Componente auxiliar para direitos
const RightItem = ({ text }) => (
  <div className="flex items-center gap-2">
    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
    <span>{text}</span>
  </div>
);

export default TermsAndPrivacy;