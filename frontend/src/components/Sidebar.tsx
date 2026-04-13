import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PanelLeftClose, PanelLeft, Settings, LogOut, Search, X, Home, Bot, Shield, User as UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SettingsModal from "@/components/SettingsModal";
import { useApp, useAppActions } from "@/store/AppContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { ViewMode } from "@/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export default function Sidebar() {
  const { state } = useApp();
  const actions = useAppActions();
  const { siteConfig } = useSiteSettings();
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const navItems: { icon: React.ReactNode; label: string; mode: ViewMode; active: boolean }[] = [
    { icon: <Home size={16} />, label: "控制台", mode: "all", active: state.viewMode === "all" || state.viewMode === "dashboard" as any },
    { icon: <Bot size={16} />, label: t('sidebar.aiChat', "AI 对话"), mode: "ai-chat", active: state.viewMode === "ai-chat" },
    { icon: <UserIcon size={16} />, label: "用户管理", mode: "users" as any, active: state.viewMode === "users" as any },
    { icon: <Shield size={16} />, label: "系统监控", mode: "monitor" as any, active: state.viewMode === "monitor" as any },
  ];

  if (state.sidebarCollapsed) {
    return (
      <div className="hidden md:flex w-12 h-full bg-app-sidebar border-r border-app-border flex-col items-center py-3 gap-2 shrink-0 transition-colors">
        <Button variant="ghost" size="icon" onClick={actions.toggleSidebar}>
          <PanelLeft size={16} />
        </Button>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full bg-app-sidebar border-r border-app-border flex flex-col shrink-0 transition-colors"
      style={{ width: undefined }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-app-border" style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)' }}>
        <h1 className="text-sm font-semibold text-tx-primary tracking-wide">{siteConfig.title}</h1>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="hidden md:inline-flex" onClick={actions.toggleSidebar}>
            <PanelLeftClose size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => actions.setMobileSidebar(false)}>
            <X size={16} />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.mode}
            onClick={() => {
               // @ts-ignore
              actions.setViewMode(item.mode);
              actions.setMobileSidebar(false);
            }}
            className={cn(
              "flex items-center gap-2.5 w-full px-2 py-1.5 rounded-md text-sm transition-colors",
              item.active
                ? "bg-app-active text-tx-primary"
                : "text-tx-secondary hover:bg-app-hover hover:text-tx-primary"
            )}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {/* Footer: Settings + Logout */}
      <div className="border-t border-app-border px-3 py-2.5 flex items-center gap-2 mt-auto">
        <button
          onClick={() => setShowSettings(true)}
          className="flex-1 flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-tx-secondary hover:text-tx-primary hover:bg-app-hover transition-colors group"
        >
          <div className="w-7 h-7 rounded-lg bg-app-hover group-hover:bg-accent-primary/10 flex items-center justify-center transition-colors">
            <Settings size={14} className="group-hover:text-accent-primary transition-colors" />
          </div>
          <span className="text-xs font-medium">{t('sidebar.settings', "系统设置")}</span>
        </button>
        <button
          onClick={() => {
            localStorage.removeItem("nowen-token");
            window.location.reload();
          }}
          title={t('sidebar.logout', "退出登录")}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-tx-tertiary hover:text-accent-danger hover:bg-accent-danger/10 transition-colors"
        >
          <LogOut size={15} />
        </button>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      </AnimatePresence>
    </div>
  );
}
