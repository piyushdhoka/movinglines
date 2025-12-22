'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Zap, Terminal, LayoutTemplate, History, MoreVertical, Cpu, PanelLeftClose, PanelLeftOpen, Box, ArrowRight, X, Loader2, LogOut, Settings, Trash2, Copy } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { generateAnimation, getTaskStatus, getChats, deleteChat, getChatHistory, Quality } from '@/lib/api';
import { VideoGallery } from '@/components/VideoGallery';

interface Chat {
  id: string;
  title: string;
  created_at: string;
}

export default function DashboardPage() {
  const { user, session, loading, signOut } = useAuth();
  const router = useRouter();
  const [currentView, setCurrentView] = useState<'workspace' | 'templates' | 'history'>('workspace');
  const [mobileTab, setMobileTab] = useState<'chat' | 'output'>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Chat State
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // Generation State
  const [prompt, setPrompt] = useState('');
  const [quality, setQuality] = useState<Quality>('m');
  const [duration, setDuration] = useState<number>(15);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Auth Check
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Fetch Chats
  useEffect(() => {
    if (session?.access_token) {
      loadChats();
    }
  }, [session?.access_token]);

  const loadChats = async () => {
    if (!session?.access_token) return;
    try {
      const data = await getChats(session.access_token);
      setChats(data);
    } catch (err) {
      console.error('Failed to load chats:', err);
    }
  };

  // Load Chat History
  useEffect(() => {
    if (activeChatId && session?.access_token) {
      loadChatHistory(activeChatId);
    }
  }, [activeChatId, session?.access_token]);

  const loadChatHistory = async (chatId: string) => {
    if (!session?.access_token) return;
    try {
      const history = await getChatHistory(chatId, session.access_token);
      if (history && history.length > 0) {
        // Load the most recent task
        const lastTask = history[0];
        setPrompt(lastTask.prompt);
        setVideoUrl(lastTask.video_url || null);
        setGeneratedCode(lastTask.generated_script || '');

        // Resume polling if not complete
        if (lastTask.status !== 'completed' && lastTask.status !== 'failed') {
          setTaskId(lastTask.id);
          setIsGenerating(true);
          setStatus(lastTask.status);
        } else {
          setTaskId(null);
          setIsGenerating(false);
          setStatus(lastTask.status);
        }
      } else {
        // Empty chat
        setPrompt('');
        setVideoUrl(null);
        setGeneratedCode('');
        setTaskId(null);
        setIsGenerating(false);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (!session?.access_token) return;

    if (!confirm('Are you sure you want to delete this chat?')) return;

    try {
      await deleteChat(chatId, session.access_token);
      setChats(chats.filter(c => c.id !== chatId));
      if (activeChatId === chatId) {
        handleNewChat();
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
      alert('Failed to delete chat');
    }
  };

  // Polling Logic
  useEffect(() => {
    if (!taskId || !session?.access_token) return;

    const interval = setInterval(async () => {
      try {
        const data = await getTaskStatus(taskId, session.access_token);
        setStatus(data.status);
        setProgress(data.progress || 0);

        if (data.status === 'completed') {
          clearInterval(interval);
          setTaskId(null);
          setIsGenerating(false);
          if (data.video_url) setVideoUrl(data.video_url);
          if (data.generated_script) setGeneratedCode(data.generated_script);
        } else if (data.status === 'failed') {
          clearInterval(interval);
          setError(data.error || 'Generation failed');
          setTaskId(null);
          setIsGenerating(false);
        }
      } catch (err) {
        console.error('Status check failed:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [taskId, session?.access_token]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating || !session?.access_token) return;

    setIsGenerating(true);
    setError('');
    setStatus('starting');
    setProgress(0);
    setVideoUrl(null);

    try {
      const data = await generateAnimation(prompt, quality, duration, session.access_token, activeChatId || undefined);
      setTaskId(data.task_id);

      if (!activeChatId && data.chat_id) {
        setActiveChatId(data.chat_id);
        loadChats();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start generation');
      setIsGenerating(false);
    }
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setPrompt('');
    setVideoUrl(null);
    setGeneratedCode('');
    setError('');
    setTaskId(null);
    setIsGenerating(false);
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>;
  if (!user) return null;

  return (
    <div className="h-screen bg-black flex overflow-hidden font-sans text-zinc-300">
      {/* Sidebar */}
      <aside className={`fixed md:relative z-[100] h-full transition-all duration-300 border-r border-white/[0.06] bg-[#050505] ${isSidebarOpen ? 'w-full md:w-64' : 'w-0 border-none'} flex flex-col overflow-hidden`}>
        <div className="p-6 flex items-center justify-between shrink-0 min-w-[256px]">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-white rounded flex items-center justify-center"><Zap size={12} fill="black" /></div>
            <span className="font-bold text-[13px] text-white">MOVINGLINES</span>
          </div>
          <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}><X size={20} /></button>
        </div>

        <div className="px-4 mb-6 shrink-0">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 p-3 bg-white text-black rounded-xl text-[11px] font-black hover:bg-zinc-200 transition-colors"
          >
            <Plus size={14} /> NEW CHAT
          </button>
        </div>

        <div className="px-4 space-y-2 shrink-0">
          <button onClick={() => setCurrentView('workspace')} className={`w-full flex items-center gap-3 p-3 rounded-xl text-[11px] font-bold ${currentView === 'workspace' ? 'bg-white/[0.06] text-white' : 'text-zinc-500 hover:text-white'}`}><Terminal size={14} /> WORKSPACE</button>
          <button onClick={() => setCurrentView('templates')} className={`w-full flex items-center gap-3 p-3 rounded-xl text-[11px] font-bold ${currentView === 'templates' ? 'bg-white/[0.06] text-white' : 'text-zinc-500 hover:text-white'}`}><LayoutTemplate size={14} /> TEMPLATES</button>
          <button onClick={() => setCurrentView('history')} className={`w-full flex items-center gap-3 p-3 rounded-xl text-[11px] font-bold ${currentView === 'history' ? 'bg-white/[0.06] text-white' : 'text-zinc-500 hover:text-white'}`}><History size={14} /> HISTORY</button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <div className="text-[10px] font-bold text-zinc-600 mb-3 px-2">RECENT CHATS</div>
          {chats.map(chat => (
            <div
              key={chat.id}
              className={`group w-full flex items-center justify-between p-2 rounded-lg transition-colors ${activeChatId === chat.id ? 'bg-white/[0.06] text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <button
                onClick={() => {
                  setActiveChatId(chat.id);
                  setCurrentView('workspace');
                }}
                className="flex-1 text-left text-[11px] truncate mr-2"
              >
                {chat.title}
              </button>
              <button
                onClick={(e) => handleDeleteChat(e, chat.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded text-zinc-500 hover:text-red-400 transition-all"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-white/[0.06] shrink-0 relative">
          {isUserMenuOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
              <button className="w-full flex items-center gap-3 p-3 text-[11px] font-bold text-zinc-400 hover:text-white hover:bg-white/[0.03] transition-colors">
                <Settings size={14} /> SETTINGS
              </button>
              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-3 p-3 text-[11px] font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={14} /> LOG OUT
              </button>
            </div>
          )}
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-full flex items-center gap-3 hover:bg-white/[0.03] p-2 rounded-lg transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {user.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-white truncate">{user.email}</div>
              <div className="text-[9px] text-zinc-500">Pro Plan</div>
            </div>
            <MoreVertical size={14} className="text-zinc-500" />
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col bg-black min-w-0">
        <header className="h-14 border-b border-white/[0.06] flex items-center justify-between px-6 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-zinc-600 hover:text-white">
              {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>
            {!isSidebarOpen && (
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white rounded flex items-center justify-center"><Zap size={12} fill="black" /></div>
                <span className="font-bold text-[13px] text-white">MOVINGLINES</span>
              </div>
            )}
          </div>
          <div className="flex gap-4">
          </div>
        </header>

        {currentView === 'workspace' ? (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
            {/* Mobile Workspace Tabs */}
            <div className="md:hidden flex h-10 border-b border-white/[0.06] bg-black">
              <button onClick={() => setMobileTab('chat')} className={`flex-1 text-[10px] font-bold ${mobileTab === 'chat' ? 'text-white border-b' : 'text-zinc-600'}`}>STUDIO</button>
              <button onClick={() => setMobileTab('output')} className={`flex-1 text-[10px] font-bold ${mobileTab === 'output' ? 'text-white border-b' : 'text-zinc-600'}`}>OUTPUT</button>
            </div>

            {/* Chat Pane */}
            <div className={`${mobileTab === 'chat' ? 'flex' : 'hidden'} md:flex w-full md:w-[400px] border-r border-white/[0.06] flex-col bg-[#050505]`}>
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5 text-[13px] leading-relaxed">
                  {activeChatId ? "Continuing chat session..." : "Engine Initialized. Describe your visualization."}
                </div>
                {isGenerating && (
                  <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5 text-[13px] leading-relaxed flex items-center gap-3">
                    <Loader2 className="animate-spin w-4 h-4 text-white" />
                    <span>Generating... {status} ({Math.round(progress)}%)</span>
                  </div>
                )}
                {error && (
                  <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20 text-[13px] text-red-400 leading-relaxed">
                    Error: {error}
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-white/[0.06] space-y-4">
                <div className="flex flex-wrap items-center gap-6">
                  {/* Duration Selector */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-zinc-500 tracking-wider">DURATION</span>
                    <div className="flex bg-white/[0.03] rounded-lg p-1 border border-white/10 gap-1">
                      {[15, 30, 45].map((d) => (
                        <button
                          key={d}
                          onClick={() => setDuration(d)}
                          disabled={isGenerating}
                          className={`px-3 py-1.5 rounded text-[10px] font-bold transition-all ${duration === d
                              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                              : 'text-zinc-500 hover:text-white hover:bg-white/[0.08]'
                            } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {d}s
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quality Selector */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-zinc-500 tracking-wider">QUALITY</span>
                    <div className="flex bg-white/[0.03] rounded-lg p-1 border border-white/10 gap-1">
                      {(['l', 'm', 'h', 'k'] as Quality[]).map((q) => (
                        <button
                          key={q}
                          onClick={() => setQuality(q)}
                          disabled={isGenerating}
                          className={`px-3 py-1.5 rounded text-[10px] font-bold transition-all ${quality === q
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                              : 'text-zinc-500 hover:text-white hover:bg-white/[0.08]'
                            } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {q === 'k' ? '4K' : (q === 'l' ? '420p' : q === 'm' ? '720p' : '1080p')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleGenerate();
                    }
                  }}
                  placeholder="Animate a 3D Fourier transform..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-sm focus:border-white/30 outline-none resize-none h-24 text-white pr-12"
                />
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="absolute bottom-3 right-3 p-2 bg-white text-black rounded-lg hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Viewport Pane */}
            <div className={`${mobileTab === 'output' ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-black`}>
              <div className="h-12 border-b border-white/[0.06] flex px-6 items-center gap-8">
                <span className="text-[10px] font-black text-white border-b-2 border-orange-500 h-full flex items-center">VIEWPORT</span>
                <span className="text-[10px] font-black text-zinc-600">SOURCE</span>
              </div>
              <div className="flex-1 flex items-center justify-center p-4 bg-[#020202]">
                {videoUrl ? (
                  <div className="w-full max-w-4xl aspect-video bg-black border border-white/5 rounded-[2rem] shadow-2xl overflow-hidden relative group">
                    <video src={videoUrl} controls className="w-full h-full object-contain" />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch(videoUrl);
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `generated-animation.mp4`;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                          } catch (error) {
                            console.error('Download failed:', error);
                            window.open(videoUrl, '_blank');
                          }
                        }}
                        className="p-2 bg-black/50 backdrop-blur-md rounded-lg text-white hover:bg-black/70 transition-colors"
                        title="Download Video"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-2xl aspect-video bg-[#050505] border border-white/5 rounded-[2rem] shadow-2xl flex flex-col items-center justify-center text-zinc-700 gap-4">
                    <Box size={40} />
                    <span className="text-xs font-medium">No output generated</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : currentView === 'history' ? (
          <div className="flex-1 overflow-y-auto p-12">
            <h2 className="text-2xl font-bold text-white mb-8">Your History</h2>
            <VideoGallery />
          </div>
        ) : (
          /* Template Gallery */
          <div className="flex-1 overflow-y-auto p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-[2rem] p-8">
                  <div className="w-10 h-10 bg-black rounded-xl mb-6" />
                  <h3 className="font-bold text-white mb-2">Fourier Expansion</h3>
                  <p className="text-zinc-500 text-xs mb-8">Animate rotating vectors constructing a square wave.</p>
                  <button className="w-full h-10 bg-white text-black text-[11px] font-black rounded-xl flex items-center justify-center gap-2">
                    <Copy size={14} /> COPY PROMPT
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
