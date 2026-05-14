import React, { useEffect, useState } from 'react';
import { discnotifApi } from '../../api/discnotifApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useAuthStore from '../../store/authStore';
import { 
  TrashIcon, 
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  UserIcon,
  ArrowUturnLeftIcon,
  PaperAirplaneIcon,
  LockClosedIcon,
  EyeSlashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/formatUtils';

const ModerateDiscussionsPage = () => {
  const { user } = useAuthStore();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  
  // Selected thread view
  const [selectedThread, setSelectedThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [postingReply, setPostingReply] = useState(false);

  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const res = await discnotifApi.getAllThreads();
      setThreads(res.data);
    } catch (err) {
      toast.error('Failed to load discussions');
    } finally {
      setLoading(false);
    }
  };

  const handleThreadSelect = async (thread) => {
    setSelectedThread(thread);
    setRepliesLoading(true);
    try {
      // Admin sees everything
      const res = await discnotifApi.getRepliesByThread(thread.threadId, user.userId, user.role);
      setReplies(res.data);
    } catch (err) {
      toast.error('Failed to load replies');
    } finally {
      setRepliesLoading(false);
    }
  };

  const handleDelete = async (threadId) => {
    if (!window.confirm('Are you sure you want to delete this discussion and all its replies? This action cannot be undone.')) return;
    
    try {
      await discnotifApi.deleteThread(threadId);
      setThreads(threads.filter(t => t.threadId !== threadId));
      if (selectedThread?.threadId === threadId) {
          setSelectedThread(null);
      }
      toast.success('Discussion deleted successfully');
    } catch (err) {
      toast.error('Failed to delete discussion');
    }
  };

  const handlePostReply = async (e) => {
    e.preventDefault();
    if (!replyBody.trim()) return;
    
    setPostingReply(true);
    try {
      const res = await discnotifApi.postReply({
        threadId: selectedThread.threadId,
        authorId: user.userId,
        body: replyBody,
        isPrivate: isPrivate
      });
      setReplies([...replies, res.data]);
      setReplyBody('');
      setIsPrivate(false);
      toast.success(isPrivate ? 'Private reply sent to owner!' : 'Reply posted publicly!');
    } catch (err) {
      toast.error('Failed to post reply');
    } finally {
      setPostingReply(false);
    }
  };

  const filteredThreads = threads.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                         t.body.toLowerCase().includes(search.toLowerCase()) ||
                         t.authorName?.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = courseFilter === '' || t.courseId.toString() === courseFilter;
    return matchesSearch && matchesCourse;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Platform Discussions</h1>
          <p className="text-gray-500 mt-2 font-medium">Moderate and join discussions. Private replies are only visible to you and the student.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <input 
              type="number" 
              placeholder="Filter by Course ID..." 
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-primary-500 focus:border-primary-500 w-full sm:w-48 shadow-sm"
            />
            <AcademicCapIcon className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Threads List */}
        <div className={`lg:w-1/2 flex flex-col space-y-4 ${selectedThread ? 'hidden lg:flex' : 'flex'}`}>
            <div className="p-1 flex bg-gray-100 rounded-xl max-w-md">
                <div className="relative flex-grow">
                    <input 
                        type="text" 
                        placeholder="Search topics..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border-transparent bg-transparent rounded-xl text-sm focus:ring-0 focus:border-transparent"
                    />
                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
                </div>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                {filteredThreads.map((thread) => (
                    <div 
                        key={thread.threadId}
                        onClick={() => handleThreadSelect(thread)}
                        className={`group relative p-6 bg-white border rounded-2xl transition-all cursor-pointer hover:shadow-md ${
                            selectedThread?.threadId === thread.threadId ? 'border-primary-500 ring-1 ring-primary-500 shadow-sm' : 'border-gray-100 hover:border-primary-200'
                        }`}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-grow">
                                <h3 className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">{thread.title}</h3>
                                <div className="flex items-center mt-2 space-x-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <span className="flex items-center"><AcademicCapIcon className="h-3 w-3 mr-1" /> #{thread.courseId}</span>
                                    <span className="flex items-center"><UserIcon className="h-3 w-3 mr-1" /> {thread.authorName || `User #${thread.authorId}`}</span>
                                    <span>{formatDate(thread.createdAt)}</span>
                                </div>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleDelete(thread.threadId); }}
                                className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                ))}
                {filteredThreads.length === 0 && (
                    <div className="p-20 text-center text-gray-400 text-sm italic bg-white border border-dashed border-gray-200 rounded-2xl">
                        No discussions found.
                    </div>
                )}
            </div>
        </div>

        {/* Thread Detail & Reply */}
        <div className={`lg:w-1/2 bg-white border border-gray-100 rounded-3xl shadow-sm flex flex-col min-h-[60vh] max-h-[85vh] overflow-hidden ${!selectedThread ? 'hidden lg:flex items-center justify-center bg-gray-50/50 border-dashed border-gray-200' : 'flex'}`}>
            {selectedThread ? (
                <>
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between shrink-0">
                        <button 
                            onClick={() => setSelectedThread(null)}
                            className="lg:hidden p-2 text-gray-400 hover:text-gray-900 mr-2"
                        >
                            <ArrowUturnLeftIcon className="h-5 w-5" />
                        </button>
                        <div className="flex-grow">
                            <h2 className="text-lg font-black text-gray-900 line-clamp-1">{selectedThread.title}</h2>
                            <p className="text-xs text-gray-400 font-medium mt-0.5">Moderate this conversation</p>
                        </div>
                        <button onClick={() => setSelectedThread(null)} className="hidden lg:block text-gray-300 hover:text-gray-600 transition-colors">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="flex-grow overflow-y-auto p-6 space-y-8 custom-scrollbar">
                        {/* Original Post */}
                        <div className="bg-primary-50/30 p-6 rounded-2xl border border-primary-50">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xs">
                                    {selectedThread.authorId}
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-gray-900">{selectedThread.authorName || `User #${selectedThread.authorId}`}</div>
                                    <div className="text-[10px] text-gray-400 font-medium">{formatDate(selectedThread.createdAt)}</div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedThread.body}</p>
                        </div>

                        {/* Replies List */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center">
                                <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                                {replies.length} Replies
                            </h3>
                            
                            {repliesLoading ? (
                                <div className="py-10 flex justify-center"><LoadingSpinner /></div>
                            ) : (
                                <div className="space-y-4">
                                    {replies.map((reply) => (
                                        <div 
                                            key={reply.replyId} 
                                            className={`p-4 rounded-2xl border transition-all ${
                                                reply.isPrivate 
                                                ? 'bg-purple-50/50 border-purple-100' 
                                                : 'bg-white border-gray-100'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center space-x-2">
                                                    <div className="text-xs font-black text-gray-900">
                                                        {reply.authorId === user.userId ? 'You (Admin)' : `User #${reply.authorId}`}
                                                    </div>
                                                    {reply.isPrivate && (
                                                        <span className="flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-purple-100 text-purple-700">
                                                            <EyeSlashIcon className="h-2 w-2 mr-1" /> Private
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-gray-400">{formatDate(reply.createdAt)}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 leading-relaxed">{reply.body}</p>
                                        </div>
                                    ))}
                                    {replies.length === 0 && (
                                        <div className="py-10 text-center text-xs text-gray-400 italic">No replies yet.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Admin Reply Form */}
                    <div className="p-6 border-t border-gray-50 bg-gray-50/30 shrink-0">
                        <form onSubmit={handlePostReply} className="space-y-4">
                            <div className="relative">
                                <textarea 
                                    placeholder="Write your moderation reply..."
                                    value={replyBody}
                                    onChange={(e) => setReplyBody(e.target.value)}
                                    className="w-full border-gray-200 rounded-2xl focus:border-primary-500 focus:ring-primary-500 text-sm font-medium p-4 pr-12 transition-all min-h-[100px] shadow-sm bg-white"
                                />
                                <button 
                                    type="submit"
                                    disabled={postingReply || !replyBody.trim()}
                                    className="absolute bottom-4 right-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white p-2.5 rounded-xl transition-all shadow-md active:scale-95"
                                >
                                    <PaperAirplaneIcon className={`h-5 w-5 ${postingReply ? 'animate-pulse' : ''}`} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="flex items-center space-x-2 cursor-pointer group">
                                    <div className={`w-10 h-5 rounded-full p-1 transition-colors ${isPrivate ? 'bg-purple-600' : 'bg-gray-200'}`}>
                                        <input 
                                            type="checkbox" 
                                            className="hidden" 
                                            checked={isPrivate} 
                                            onChange={() => setIsPrivate(!isPrivate)} 
                                        />
                                        <div className={`w-3 h-3 bg-white rounded-full transition-transform ${isPrivate ? 'translate-x-5' : ''}`} />
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors">
                                        Private Reply (Only owner sees)
                                    </span>
                                </label>
                            </div>
                        </form>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center p-10 text-center space-y-4">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                        <ChatBubbleLeftRightIcon className="h-8 w-8 text-primary-200" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-gray-900">Select a Thread</h3>
                        <p className="text-xs text-gray-400 mt-1 max-w-[200px]">Click a discussion on the left to moderate or reply.</p>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ModerateDiscussionsPage;
