// src/components/layout/Sidebar.jsx
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Settings } from 'lucide-react';

export function Sidebar() {
  const { user } = useAuth();
  
  return (
    <SidebarMenu>
      {/* Itens de menu existentes */}
      
      {/* Item de menu para configurações de admin - apenas para administradores */}
      {user?.role === 'admin' && (
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <a href="/admin/settings">
              <Settings />
              <span>Admin Settings</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}
    </SidebarMenu>
  );
}