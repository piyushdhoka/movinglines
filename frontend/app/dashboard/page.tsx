'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { generateAnimation, getTaskStatus, getChats, deleteChat, getChatHistory, Quality } from '@/lib/api';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { WorkspaceView } from '@/components/dashboard/WorkspaceView';
import { HistoryView } from '@/components/dashboard/HistoryView';
import { TemplatesView } from '@/components/dashboard/TemplatesView';

interface Chat {
  id: string;
  title: string;
  created_at: string;
}

export default function DashboardPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();
  const [currentView, setCurrentView] = useState<'workspace' | 'templates' | 'history'>('workspace');

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

  if (loading) return <div className="h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!user) return null;

  return (
    <SidebarProvider>
      <AppSidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        chats={chats}
        activeChatId={activeChatId}
        setActiveChatId={setActiveChatId}
        handleNewChat={handleNewChat}
        handleDeleteChat={handleDeleteChat}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b-2 border-border bru-shadow bg-background transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard" className="font-bold text-xs uppercase">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-bold text-xs uppercase">
                    {currentView === 'workspace' ? 'Workspace' : currentView === 'templates' ? 'Templates' : 'History'}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {currentView === 'workspace' ? (
          <WorkspaceView
            activeChatId={activeChatId}
            prompt={prompt}
            setPrompt={setPrompt}
            quality={quality}
            setQuality={setQuality}
            duration={duration}
            setDuration={setDuration}
            isGenerating={isGenerating}
            status={status}
            progress={progress}
            error={error}
            videoUrl={videoUrl}
            generatedCode={generatedCode}
            handleGenerate={handleGenerate}
          />
        ) : currentView === 'history' ? (
          <HistoryView />
        ) : (
          <TemplatesView />
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
