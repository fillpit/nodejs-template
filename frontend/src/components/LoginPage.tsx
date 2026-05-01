import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Lock, User, BookOpen, Globe, CheckCircle2, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getServerUrl, setServerUrl, clearServerUrl, testServerConnection } from "@/lib/api";
import { cn } from "@/lib/utils";

interface LoginPageProps {
  onLogin: (token: string, user: any) => void;
  /** 是否为客户端模式（Electron / Android / 曾配置过服务器地址） */
  isClientMode?: boolean;
  onDisconnect?: () => void;
}

export default function LoginPage({ onLogin, isClientMode = false, onDisconnect }: LoginPageProps) {
  const [serverAddress, setServerAddress] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [serverStatus, setServerStatus] = useState<"idle" | "checking" | "ok" | "fail">("idle");
  const { t } = useTranslation();

  // 回填上次的服务器地址
  useEffect(() => {
    if (isClientMode) {
      const saved = getServerUrl() || localStorage.getItem("nowen-server-url-last") || "";
      if (saved) {
        setServerAddress(saved.replace(/^https?:\/\//, ""));
        setServerStatus("ok"); // 曾连接成功过
      }
    }
  }, [isClientMode]);

  // 服务器地址失去焦点时自动检测连通性
  const handleServerBlur = async () => {
    if (!isClientMode || !serverAddress.trim()) return;
    
    let url = serverAddress.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `http://${url}`;
    }

    setServerStatus("checking");
    const result = await testServerConnection(url);
    setServerStatus(result.ok ? "ok" : "fail");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let baseUrl = "";

      if (isClientMode) {
        // 客户端模式：先验证服务器连通性
        let url = serverAddress.trim();
        if (!url) {
          setError(t("auth.serverRequired"));
          setIsLoading(false);
          return;
        }
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          url = `http://${url}`;
        }

        setServerStatus("checking");
        const serverResult = await testServerConnection(url);
        if (!serverResult.ok) {
          setServerStatus("fail");
          setError(serverResult.error || t("server.connectFailed"));
          setIsLoading(false);
          return;
        }
        setServerStatus("ok");

        // 保存服务器地址
        setServerUrl(url);
        localStorage.setItem("nowen-server-url-last", url);
        baseUrl = url;
      }

      // 登录
      const loginUrl = baseUrl ? `${baseUrl}/api/auth/login` : "/api/auth/login";
      const res = await fetch(loginUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t("auth.loginFailed"));
        setIsLoading(false);
        return;
      }

      // 存储 token
      localStorage.setItem("nowen-token", data.token);
      onLogin(data.token, data.user);
    } catch {
      setError(t("auth.networkError"));
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    clearServerUrl();
    localStorage.removeItem("nowen-token");
    setServerAddress("");
    setServerStatus("idle");
    setUsername("");
    setPassword("");
    setError("");
    onDisconnect?.();
  };

  const serverStatusIcon = () => {
    switch (serverStatus) {
      case "checking":
        return <Loader2 className="w-4 h-4 animate-spin text-amber-500" />;
      case "ok":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "fail":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 selection:bg-indigo-500/30 transition-colors relative overflow-hidden">
      {/* 增强背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.02)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.02)_100%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[420px] mx-4 z-10"
      >
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-8">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 mb-5"
            >
              <BookOpen size={28} className="text-white" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight"
            >
              {t("auth.appTitle")}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-zinc-500 dark:text-zinc-400 mt-2"
            >
              {isClientMode ? t("auth.subtitleClient") : t("auth.subtitle")}
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 服务器地址 — 仅客户端模式显示 */}
            <AnimatePresence>
              {isClientMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider ml-1">
                    {t("auth.serverAddress")}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                      <Globe className="h-4 w-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <Input
                      type="text"
                      value={serverAddress}
                      onChange={(e) => {
                        setServerAddress(e.target.value);
                        if (serverStatus !== "idle") setServerStatus("idle");
                      }}
                      onBlur={handleServerBlur}
                      className="pl-10 pr-10 py-6 bg-zinc-50/50 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-all"
                      placeholder={t("auth.serverPlaceholder")}
                      autoFocus={isClientMode}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center z-10">
                      {serverStatusIcon()}
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 ml-1">
                    {t("auth.serverHint")}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 用户名 */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider ml-1">
                {t("auth.username")}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                  <User className="h-4 w-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 py-6 bg-zinc-50/50 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-all"
                  placeholder={t("auth.usernamePlaceholder")}
                  autoComplete="username"
                  autoFocus={!isClientMode}
                  required
                />
              </div>
            </div>

            {/* 密码 */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider ml-1">
                {t("auth.password")}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                  <Lock className="h-4 w-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 py-6 bg-zinc-50/50 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-all"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {/* 错误提示 */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 登录按钮 */}
            <Button
              type="submit"
              disabled={isLoading || !username || !password || (isClientMode && !serverAddress.trim())}
              className="w-full py-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                t("auth.loginButton")
              )}
            </Button>
          </form>

          {/* 底部提示 */}
          <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              {t("auth.defaultCredentials")}
            </p>

            {/* 客户端模式：断开连接按钮 */}
            {isClientMode && getServerUrl() && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="mt-4 text-xs font-medium text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 transition-colors flex items-center justify-center gap-1.5 mx-auto"
              >
                <Globe size={12} />
                {t("auth.resetServer")}
              </button>
            )}
          </div>
        </div>

        {/* 底部说明 — 客户端模式 */}
        {isClientMode && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-[11px] text-zinc-400 dark:text-zinc-600 mt-6 px-4 leading-relaxed"
          >
            {t("auth.clientNote")}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
