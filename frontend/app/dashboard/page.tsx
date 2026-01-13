'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { generateAnimation, getTaskStatus, getChats, deleteChat, getChatHistory, Quality, getWebSocketURL, cancelAnimation } from '@/lib/api';
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
  const [chatsLoading, setChatsLoading] = useState(false);
  const [chatsError, setChatsError] = useState<string | null>(null);

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
    setChatsLoading(true);
    setChatsError(null);
    try {
      const data = await getChats(session.access_token);
      setChats(data);
    } catch (err: any) {
      setChatsError(err?.message || 'Failed to load chats');
      setChats([]);
    } finally {
      setChatsLoading(false);
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

        // Resume status tracking if not complete
        if (lastTask.status !== 'completed' && lastTask.status !== 'failed' && lastTask.status !== 'cancelled') {
          setTaskId(lastTask.id);
          setIsGenerating(true);
          setStatus(lastTask.status);
          setProgress(lastTask.progress || 0);
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

  // WebSocket for Real-time Updates
  useEffect(() => {
    if (!user?.id || !session?.access_token) return;

    const wsUrl = getWebSocketURL(user.id, session.access_token);
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('[WS] Connected to real-time updates');
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[WS] Received update:', data);

        // Only care about messages for our current taskId (if we have one)
        // or messages that tell us about a task we just started
        if (taskId && data.task_id !== taskId) return;

        setStatus(data.status);
        if (data.progress !== undefined) setProgress(data.progress);

        if (data.status === 'completed') {
          setTaskId(null);
          setIsGenerating(false);
          if (data.video_url) setVideoUrl(data.video_url);
          if (data.generated_script) setGeneratedCode(data.generated_script);
          loadChats(); // Refresh sidebar to show new chat title if it was first message
        } else if (data.status === 'failed') {
          setError(data.error || 'Generation failed');
          setTaskId(null);
          setIsGenerating(false);
        } else if (data.status === 'cancelled') {
          setStatus('cancelled');
          setTaskId(null);
          setIsGenerating(false);
        }
      } catch (err) {
        console.error('[WS] Failed to parse message:', err);
      }
    };

    socket.onclose = () => {
      console.log('[WS] Disconnected');
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [user?.id, taskId, session?.access_token]);

  const handleCancel = async () => {
    if (!taskId || !session?.access_token) return;

    try {
      await cancelAnimation(taskId, session.access_token);
      setStatus('cancelled');
      setIsGenerating(false);
      setTaskId(null);
    } catch (err) {
      console.error('Failed to cancel:', err);
      alert('Failed to cancel animation');
    }
  };

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

  // Show chat loading/error state above sidebar
  const chatStatus = (
    <>
      {chatsLoading && <div className="text-xs text-muted-foreground px-4 py-2">Loading chats...</div>}
      {chatsError && <div className="text-xs text-destructive px-4 py-2">{chatsError}</div>}
    </>
  );

  return (
    <SidebarProvider>
      {/* Show chat loading/error above sidebar */}
      {chatStatus}
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
            handleCancel={handleCancel}
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
