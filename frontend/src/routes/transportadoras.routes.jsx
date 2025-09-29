// src/routes/transportadoras.routes.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Páginas de Transportadoras
import TransportadorasList from '@/pages/transportadoras/TransportadorasList';
import TransportadoraCreate from '@/pages/transportadoras/TransportadoraCreate';
import TransportadoraEdit from '@/pages/transportadoras/TransportadoraEdit';
import TransportadoraDetails from '@/pages/transportadoras/TransportadoraDetails';

// Páginas de Vínculos (Códigos de Ocorrência)
import VinculosList from '@/pages/transportadoras/vinculos/VinculosList';
import VinculoCreate from '@/pages/transportadoras/vinculos/VinculoCreate';
import VinculoEdit from '@/pages/transportadoras/vinculos/VinculoEdit';

/**
 * Rotas de Transportadoras
 * 
 * Estrutura de rotas:
 * - /transportadoras                              → Lista de transportadoras
 * - /transportadoras/novo                         → Criar nova transportadora
 * - /transportadoras/:id                          → Visualizar transportadora
 * - /transportadoras/:id/editar                   → Editar transportadora
 * - /transportadoras/:id/vinculos                 → Lista de vínculos
 * - /transportadoras/:id/vinculos/novo            → Criar vínculo
 * - /transportadoras/:id/vinculos/:vinculoId/editar → Editar vínculo
 */
export default function TransportadorasRoutes() {
  return (
    <Routes>
      {/* ==================== TRANSPORTADORAS ==================== */}
      
      {/* Lista de transportadoras */}
      <Route index element={<TransportadorasList />} />
      
      {/* Criar nova transportadora */}
      <Route path="novo" element={<TransportadoraCreate />} />
      
      {/* Visualizar transportadora (ordem importa - deve vir antes de :id/editar) */}
      <Route path=":id" element={<TransportadoraDetails />} />
      
      {/* Editar transportadora */}
      <Route path=":id/editar" element={<TransportadoraEdit />} />

      {/* ==================== VÍNCULOS (CÓDIGOS) ==================== */}
      
      {/* Lista de vínculos de uma transportadora */}
      <Route path=":id/vinculos" element={<VinculosList />} />
      
      {/* Criar novo vínculo */}
      <Route path=":id/vinculos/novo" element={<VinculoCreate />} />
      
      {/* Editar vínculo existente */}
      <Route path=":id/vinculos/:vinculoId/editar" element={<VinculoEdit />} />
    </Routes>
  );
}