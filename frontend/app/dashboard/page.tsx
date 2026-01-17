'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { generateAnimation, getTaskStatus, getChats, deleteChat, getChatHistory, Quality, getSocketURL } from '@/lib/api';
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
import GoogleAuthLoading from '@/components/ui/GoogleAuthLoading';

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
  const taskIdRef = useRef<string | null>(null); // Ref to track taskId in WebSocket handler
  const [status, setStatus] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [wsConnected, setWsConnected] = useState(false);
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
        if (lastTask.status !== 'completed' && lastTask.status !== 'failed') {
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

  // Sync taskIdRef with taskId state
  useEffect(() => {
    taskIdRef.current = taskId;
  }, [taskId]);

  const socketRef = useRef<any>(null);

  // Socket.IO for Real-time Updates - ONLY when actively generating
  useEffect(() => {
    // Only connect if we are actively generating AND have a taskId to track
    if (!user?.id || !session?.access_token || !isGenerating || !taskId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setWsConnected(false);
      return;
    }

    // Prevent multiple connections
    if (socketRef.current?.connected) return;

    const socketUrl = getSocketURL();
    const socket = io(socketUrl, {
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('authenticate', { token: session.access_token });
    });

    socket.on('authenticated', (data: any) => {
      setWsConnected(true);
    });

    socket.on('status_update', (data: any) => {
      const currentTaskId = taskIdRef.current;
      if (currentTaskId && data.task_id !== currentTaskId) return;

      setStatus(data.status);
      if (data.progress !== undefined) setProgress(data.progress);

      if (data.status === 'completed') {
        handleTaskCompletion(data);
      } else if (data.status === 'failed') {
        handleTaskFailure(data);
      }
    });

    socket.on('connect_error', (err: any) => {
      // Reconnection logic handled by socket.io-client
    });

    socket.on('error', (data: any) => {
      console.error('[Socket.IO] Server reported error:', data.message);
      setError(data.message);
    });

    socket.on('disconnect', (reason: string) => {
      setWsConnected(false);
    });

    const handleTaskCompletion = (data: any) => {
      setTaskId(null);
      taskIdRef.current = null;
      setIsGenerating(false);
      if (data.video_url) setVideoUrl(data.video_url);
      if (data.generated_script) setGeneratedCode(data.generated_script);
      loadChats();
    };

    const handleTaskFailure = (data: any) => {
      setError(data.error || 'Generation failed');
      setTaskId(null);
      taskIdRef.current = null;
      setIsGenerating(false);
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user?.id, session?.access_token, isGenerating, taskId]);

  // Polling Fallback (Every 10s if generating but no WS updates)
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    if (isGenerating && taskId) {
      pollInterval = setInterval(async () => {
        console.log('[Dashboard] Safety poll for task:', taskId);
        try {
          const task = await getTaskStatus(taskId, session?.access_token!);

          // Only update if it's still for the current task
          if (taskIdRef.current === taskId) {
            setStatus(task.status);
            setProgress(task.progress || 0);

            if (task.status === 'completed') {
              setTaskId(null);
              taskIdRef.current = null;
              setIsGenerating(false);
              if (task.video_url) setVideoUrl(task.video_url);
              if (task.generated_script) setGeneratedCode(task.generated_script);
              loadChats();
            } else if (task.status === 'failed') {
              setError(task.error || 'Generation failed');
              setTaskId(null);
              taskIdRef.current = null;
              setIsGenerating(false);
            }
          }
        } catch (err) {
          console.error('[Dashboard] Polling failed:', err);
        }
      }, 10000);
    }

    return () => clearInterval(pollInterval);
  }, [isGenerating, taskId, session?.access_token]);



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
      taskIdRef.current = data.task_id; // Sync ref immediately

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
    taskIdRef.current = null; // Sync ref immediately
    setIsGenerating(false);
    setCurrentView('workspace');
  };


  if (loading) return <GoogleAuthLoading />;
  if (!user) return null;

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        chats={chats}
        activeChatId={activeChatId}
        setActiveChatId={setActiveChatId}
        handleNewChat={handleNewChat}
        handleDeleteChat={handleDeleteChat}
      />
      <SidebarInset className="h-svh overflow-hidden">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-white/5 bg-[#0a0a0a] transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger
              className="-ml-1 h-8 w-8 text-white hover:bg-white/10 hover:text-white"
              aria-label="Toggle sidebar"
              title="Toggle sidebar"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard" className="text-sm text-white/50 hover:text-white">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block text-white/20" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-sm font-medium text-white">
                    {currentView === 'workspace' ? 'Create' : currentView === 'templates' ? 'Templates' : 'History'}
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
