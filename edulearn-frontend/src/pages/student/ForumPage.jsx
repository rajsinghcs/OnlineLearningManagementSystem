import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { discnotifApi } from '../../api/discnotifApi';
import { courseApi } from '../../api/courseApi';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  ChatBubbleLeftRightIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  HandThumbUpIcon,
  CheckCircleIcon,
  LockClosedIcon,
  TagIcon,
  UserCircleIcon,
  ArrowUturnLeftIcon
} from '@heroicons/react/24/outline';
import { 
  HandThumbUpIcon as HandThumbUpSolid,
  CheckCircleIcon as CheckCircleSolid,
  PaperAirplaneIcon
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const ForumPage = () => {
  const { courseId } = useParams();
  const { user } = useAuthStore();
  
  const [course, setCourse] = useState(null);
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create Thread Modal/Form State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newThread, setNewThread] = useState({ title: '', body: '' });
  const [postingThread, setPostingThread] = useState(false);
  
  // Reply Form State
  const [replyBody, setReplyBody] = useState('');
  const [postingReply, setPostingReply] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [courseRes, threadsRes] = await Promise.all([
          courseApi.getCourseById(courseId),
          discnotifApi.getThreadsByCourse(courseId)
        ]);
        setCourse(courseRes.data);
        setThreads(threadsRes.data);
      } catch (err) {
        console.error('Failed to load forum data', err);
        toast.error('Error loading forum');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [courseId]);

  const handleThreadSelect = async (thread) => {
    setSelectedThread(thread);
    setRepliesLoading(true);
    try {
      const res = await discnotifApi.getRepliesByThread(thread.threadId, user.userId, user.role);
      setReplies(res.data);
    } catch (err) {
      toast.error('Failed to load replies');
    } finally {
      setRepliesLoading(false);
    }
  };

  const handleCreateThread = async (e) => {
    e.preventDefault();
    if (!newThread.title || !newThread.body) {
      toast.error('Please fill in all fields');
      return;
    }
    setPostingThread(true);
    try {
      const res = await discnotifApi.createThread({
        ...newThread,
        courseId: parseInt(courseId),
        authorId: user.userId
      });
      setThreads([res.data, ...threads]);
      setShowCreateForm(false);
      setNewThread({ title: '', body: '' });
      toast.success('Thread created successfully!');
      handleThreadSelect(res.data);
    } catch (err) {
      toast.error('Failed to create thread');
    } finally {
      setPostingThread(false);
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
        body: replyBody
      });
      setReplies([...replies, res.data]);
      setReplyBody('');
      toast.success('Reply posted!');
    } catch (err) {
      toast.error('Failed to post reply');
    } finally {
      setPostingReply(false);
    }
  };

  const handleUpvote = async (replyId) => {
    try {
      await discnotifApi.upvoteReply(replyId);
      setReplies(replies.map(r => 
        r.replyId === replyId ? { ...r, upvotes: r.upvotes + 1 } : r
      ));
    } catch (err) {
      toast.error('Failed to upvote');
    }
  };

  const handleAccept = async (replyId) => {
    // Only author or admin should ideally do this, but keeping it simple for now
    try {
      await discnotifApi.acceptReply(replyId);
      setReplies(replies.map(r => 
        r.replyId === replyId ? { ...r, isAccepted: true } : { ...r, isAccepted: false }
      ));
      toast.success('Answer accepted!');
    } catch (err) {
      toast.error('Failed to accept answer');
    }
  };

  const filteredThreads = threads.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50 overflow-hidden">
      {/* Forum Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center space-x-4">
          <Link to={`/student/learn/${courseId}/0`} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <ChevronLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">{course?.title} Discussion</h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Course Community Forum</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative hidden md:block">
            <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search threads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:ring-primary-500 focus:border-primary-500 rounded-xl text-sm w-64 transition-all"
            />
          </div>
          <button 
            onClick={() => setShowCreateForm(true)}
            className="btn-primary flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary-200"
          >
            <PlusIcon className="h-4 w-4" />
            <span>New Thread</span>
          </button>
        </div>
      </div>

      <div className="flex flex-grow overflow-hidden">
        {/* Threads Sidebar */}
        <aside className={`w-full md:w-96 border-r border-gray-200 bg-white flex flex-col transition-all ${selectedThread ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{filteredThreads.length} ACTIVE THREADS</span>
          </div>
          <div className="flex-grow overflow-y-auto custom-scrollbar">
            {filteredThreads.map(thread => (
              <button 
                key={thread.threadId}
                onClick={() => handleThreadSelect(thread)}
                className={`w-full text-left p-6 border-b border-gray-50 transition-all hover:bg-gray-50 group relative ${
                  selectedThread?.threadId === thread.threadId ? 'bg-primary-50/50 border-l-4 border-l-primary-600' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`text-sm font-bold leading-tight line-clamp-2 ${
                    selectedThread?.threadId === thread.threadId ? 'text-primary-600' : 'text-gray-900 group-hover:text-primary-600'
                  }`}>
                    {thread.title}
                  </h3>
                  {thread.isPinned && <TagIcon className="h-4 w-4 text-amber-500 flex-shrink-0 ml-2" />}
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{thread.body}</p>
                <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <div className="flex items-center">
                    <UserCircleIcon className="h-3 w-3 mr-1" />
                    <span>User #{thread.authorId}</span>
                  </div>
                  <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                </div>
                {thread.isClosed && <div className="absolute top-2 right-2"><LockClosedIcon className="h-3 w-3 text-gray-300" /></div>}
              </button>
            ))}
            {filteredThreads.length === 0 && (
              <div className="p-10 text-center space-y-4">
                <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-gray-300" />
                </div>
                <p className="text-sm text-gray-400 italic">No threads found.</p>
              </div>
            )}
          </div>
        </aside>

        {/* Thread Detail View */}
        <main className={`flex-grow flex flex-col bg-white transition-all ${!selectedThread ? 'hidden md:flex' : 'flex'}`}>
          {selectedThread ? (
            <>
              {/* Thread Content */}
              <div className="flex-grow overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto p-8 md:p-12">
                  {/* Back button for mobile */}
                  <button 
                    onClick={() => setSelectedThread(null)}
                    className="flex md:hidden items-center text-xs font-black text-primary-600 uppercase tracking-widest mb-6"
                  >
                    <ArrowUturnLeftIcon className="h-4 w-4 mr-2" />
                    Back to Threads
                  </button>

                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        {selectedThread.isPinned && (
                          <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Pinned</span>
                        )}
                        {selectedThread.isClosed && (
                          <span className="bg-gray-100 text-gray-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Closed</span>
                        )}
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Posted in {course?.title}</span>
                      </div>
                      <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">{selectedThread.title}</h2>
                      <div className="flex items-center space-x-4 border-b border-gray-100 pb-6">
                        <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                          {selectedThread.authorId}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">User #{selectedThread.authorId}</div>
                          <div className="text-xs text-gray-400 font-medium">{new Date(selectedThread.createdAt).toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="text-gray-700 leading-relaxed text-lg pt-4 whitespace-pre-wrap">
                        {selectedThread.body}
                      </div>
                    </div>

                    {/* Replies Section */}
                    <div className="pt-12 space-y-8">
                      <h3 className="text-lg font-black text-gray-900 flex items-center space-x-3">
                        <ChatBubbleLeftRightIcon className="h-6 w-6 text-primary-600" />
                        <span>{replies.length} Replies</span>
                      </h3>

                      {repliesLoading ? (
                        <div className="py-20 flex justify-center"><LoadingSpinner /></div>
                      ) : (
                        <div className="space-y-6">
                          {replies.map(reply => (
                            <div 
                              key={reply.replyId} 
                              className={`p-6 rounded-2xl border transition-all ${
                                reply.isAccepted 
                                ? 'bg-secondary-50 border-secondary-200 shadow-sm' 
                                : 'bg-white border-gray-100 hover:border-gray-200'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center space-x-3">
                                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                    reply.isAccepted ? 'bg-secondary-200 text-secondary-700' : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {reply.authorId}
                                  </div>
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <div className="text-xs font-bold text-gray-900">User #{reply.authorId}</div>
                                      {reply.isPrivate && (
                                        <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-purple-100 text-purple-700">
                                          Private
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-gray-400 font-medium">{new Date(reply.createdAt).toLocaleString()}</div>
                                  </div>
                                </div>
                                {reply.isAccepted && (
                                  <div className="flex items-center text-secondary-600 space-x-1">
                                    <CheckCircleSolid className="h-5 w-5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Accepted Answer</span>
                                  </div>
                                )}
                              </div>
                              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-6">
                                {reply.body}
                              </div>
                              <div className="flex items-center space-x-6">
                                <button 
                                  onClick={() => handleUpvote(reply.replyId)}
                                  className="flex items-center space-x-1.5 text-xs font-bold text-gray-500 hover:text-primary-600 transition-colors group"
                                >
                                  <HandThumbUpIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                  <span>{reply.upvotes} Upvotes</span>
                                </button>
                                
                                {!reply.isAccepted && (user?.userId === selectedThread.authorId || user?.role === 'ADMIN') && (
                                  <button 
                                    onClick={() => handleAccept(reply.replyId)}
                                    className="flex items-center space-x-1.5 text-xs font-bold text-gray-500 hover:text-secondary-600 transition-colors"
                                  >
                                    <CheckCircleIcon className="h-4 w-4" />
                                    <span>Accept as Answer</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                          {replies.length === 0 && (
                            <div className="py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 text-center">
                              <p className="text-sm text-gray-400 italic">No replies yet. Be the first to join the conversation!</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reply Input Bar */}
              <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="max-w-4xl mx-auto">
                  {selectedThread.isClosed ? (
                    <div className="bg-gray-50 text-gray-500 p-4 rounded-xl text-center text-sm font-medium flex items-center justify-center space-x-2">
                      <LockClosedIcon className="h-4 w-4" />
                      <span>This thread is closed and cannot receive new replies.</span>
                    </div>
                  ) : (
                    <form onSubmit={handlePostReply} className="flex items-end space-x-4">
                      <div className="flex-grow">
                        <textarea 
                          placeholder="Type your reply here..."
                          value={replyBody}
                          onChange={(e) => setReplyBody(e.target.value)}
                          className="w-full border-gray-200 rounded-2xl focus:border-primary-500 focus:ring-primary-500 text-sm font-medium py-3 px-4 transition-all min-h-[50px] max-h-[150px]"
                          rows="1"
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={postingReply || !replyBody.trim()}
                        className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white p-3.5 rounded-2xl transition-all shadow-lg shadow-primary-200 active:scale-95"
                      >
                        <PaperAirplaneIcon className={`h-5 w-5 ${postingReply ? 'animate-pulse' : ''}`} />
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center space-y-6 p-10 text-center">
              <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="h-12 w-12 text-primary-200" />
              </div>
              <div className="max-w-xs">
                <h3 className="text-xl font-black text-gray-900 mb-2">Select a thread</h3>
                <p className="text-gray-500 text-sm font-medium">Choose a conversation from the list to view details and join the discussion.</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Create Thread Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-xl font-black text-gray-900">Start a New Discussion</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Ask a question or share something with the class</p>
              </div>
              <button onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-2">
                <ChevronLeftIcon className="h-6 w-6 rotate-180" />
              </button>
            </div>
            <form onSubmit={handleCreateThread} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Topic Title</label>
                <input 
                  type="text" 
                  value={newThread.title}
                  onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                  placeholder="What's on your mind?"
                  className="w-full border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500 text-sm font-bold py-4 px-5 transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Description / Question</label>
                <textarea 
                  value={newThread.body}
                  onChange={(e) => setNewThread({ ...newThread, body: e.target.value })}
                  placeholder="Provide more details so others can help..."
                  className="w-full border-gray-200 rounded-xl focus:border-primary-500 focus:ring-primary-500 text-sm font-medium py-4 px-5 transition-all min-h-[150px]"
                  required
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowCreateForm(false)}
                  className="flex-grow py-4 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={postingThread}
                  className="flex-grow bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white py-4 rounded-2xl text-sm font-black shadow-xl shadow-primary-200 transition-all transform active:scale-95"
                >
                  {postingThread ? 'Creating...' : 'Post Thread'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumPage;
