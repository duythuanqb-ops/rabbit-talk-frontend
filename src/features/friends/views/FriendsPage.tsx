'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Search, 
  Clock, 
  Check, 
  X, 
  AlertCircle, 
  Loader2,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { friendsService } from '../services/friends.service';
import { Friend, PendingRequest, SearchUserResult } from '../types/friends.types';
import { getProfile } from '@/features/auth/services/auth.service';

export function FriendsPage() {
  // Tabs: 'friends' | 'pending' | 'find'
  const [activeTab, setActiveTab] = useState<'friends' | 'pending' | 'find'>('friends');
  
  // Data States
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [searchResults, setSearchResults] = useState<SearchUserResult[]>([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [directAddQuery, setDirectAddQuery] = useState('');
  const [directAddLoading, setDirectAddLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  
  // Notification states
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    friendUuid: string;
    friendName: string;
  } | null>(null);

  // Load initial data
  useEffect(() => {
    getProfile()
      .then((res) => {
        const user = res.data || res;
        setCurrentUserId(user.uuid || '');
      })
      .catch((err) => console.error("Failed to load user profile", err));

    loadFriendsAndPending();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const loadFriendsAndPending = async () => {
    setLoading(true);
    try {
      const [friendsRes, pendingRes] = await Promise.all([
        friendsService.getFriends(),
        friendsService.getPendingRequests()
      ]);
      setFriends(friendsRes.data || []);
      setPendingRequests(pendingRes.data || []);
    } catch (error) {
      console.error("Failed to fetch friends data", error);
      showNotification('error', 'Failed to load friends list.');
    } finally {
      setLoading(false);
    }
  };

  // Handle direct send request (by email or username)
  const handleDirectAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directAddQuery.trim()) return;
    
    setDirectAddLoading(true);
    try {
      const res = await friendsService.sendFriendRequest(directAddQuery.trim());
      showNotification('success', res.message || 'Friend request sent successfully!');
      setDirectAddQuery('');
      // Reload both lists
      loadFriendsAndPending();
    } catch (error: any) {
      console.error(error);
      const errMsg = error.message || 'Failed to send friend request. Check the username or email.';
      showNotification('error', errMsg);
    } finally {
      setDirectAddLoading(false);
    }
  };

  // Handle search tab queries
  const handleSearchUsers = async (queryStr: string) => {
    setSearchQuery(queryStr);
    if (!queryStr.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const res = await friendsService.searchUsers(queryStr.trim());
      setSearchResults(res.data || []);
    } catch (error) {
      console.error("Failed searching users", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Respond to pending requests (Accept/Decline)
  const handleRespondRequest = async (requestId: string, accept: boolean) => {
    try {
      const res = await friendsService.respondFriendRequest(requestId, accept);
      showNotification('success', res.message || (accept ? 'Request accepted!' : 'Request declined.'));
      // Reload
      loadFriendsAndPending();
    } catch (error: any) {
      showNotification('error', error.message || 'Failed to respond to request.');
    }
  };

  // Open confirm modal
  const handleUnfriendClick = (friendUuid: string, friendName: string) => {
    setConfirmModal({ isOpen: true, friendUuid, friendName });
  };

  // Execute unfriend from modal
  const executeUnfriend = async () => {
    if (!confirmModal) return;
    try {
      const res = await friendsService.unfriend(confirmModal.friendUuid);
      showNotification('success', res.message || 'Unfriended successfully.');
      setConfirmModal(null);
      loadFriendsAndPending();
      // If we are searching, update search query list to reflect change
      if (searchQuery) {
        handleSearchUsers(searchQuery);
      }
    } catch (error: any) {
      showNotification('error', error.message || 'Failed to unfriend.');
      setConfirmModal(null);
    }
  };

  // Send request from Search Tab list
  const handleSendRequestFromSearch = async (userUuid: string, identifier: string) => {
    try {
      const res = await friendsService.sendFriendRequest(identifier);
      showNotification('success', res.message || 'Friend request sent!');
      // Refresh search results to show "Pending"
      handleSearchUsers(searchQuery);
      loadFriendsAndPending();
    } catch (error: any) {
      showNotification('error', error.message || 'Failed to send friend request.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative pb-16">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl transition-all border animate-in slide-in-from-bottom-5 duration-300 ${
          notification.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {notification.type === 'success' ? (
            <div className="bg-emerald-500 text-white rounded-full p-1"><Check size={16} /></div>
          ) : (
            <div className="bg-rose-500 text-white rounded-full p-1"><AlertCircle size={16} /></div>
          )}
          <span className="font-medium text-sm">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-70"><X size={16} /></button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 p-8 md:p-10 rounded-3xl text-white shadow-xl shadow-emerald-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles size={12} /> Peer Connection
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Friends & Connections</h1>
          <p className="text-white/80 max-w-lg text-sm md:text-base">
            Build your studying circle, keep track of classmates' progress, and challenge each other in Live Vocab Battles!
          </p>
        </div>

        {/* Direct Add Friend Form */}
        <form onSubmit={handleDirectAdd} className="w-full md:w-auto relative z-10 flex gap-2">
          <div className="relative w-full md:w-72">
            <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" size={18} />
            <input 
              type="text" 
              placeholder="Username or email..." 
              value={directAddQuery}
              onChange={(e) => setDirectAddQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white text-slate-800 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-400 focus:outline-none placeholder-slate-400 shadow-lg border border-slate-100/50"
            />
          </div>
          <button 
            type="submit"
            disabled={directAddLoading}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-sm font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            {directAddLoading ? <Loader2 className="animate-spin" size={16} /> : 'Add'}
          </button>
        </form>

        {/* Background blobs */}
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 top-0 w-40 h-40 bg-lime-300/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 gap-1.5 p-1 bg-slate-100 rounded-2xl max-w-xl">
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'friends'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Users size={16} />
          My Friends
          {friends.length > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
              {friends.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'pending'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Clock size={16} />
          Pending
          {pendingRequests.length > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-bold animate-pulse">
              {pendingRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('find')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'find'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Search size={16} />
          Find People
        </button>
      </div>

      {/* Main Tab Views */}
      <div className="mt-6">
        {loading ? (
          /* Loading State Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 animate-pulse">
                <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 bg-slate-200 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-slate-200 rounded w-full" />
                <div className="h-9 bg-slate-100 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* TAB 1: MY FRIENDS */}
            {activeTab === 'friends' && (
              friends.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-xl mx-auto p-8 space-y-6">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto shadow-inner">
                    <Users size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900">Your Friend List is Empty</h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto">
                      Studying is always better with others! Search for your classmates, add them, and grow your vocabulary together.
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('find')}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    Find Friends
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {friends.map((friend) => (
                    <div 
                      key={friend.uuid}
                      className="bg-white rounded-3xl border border-slate-100/80 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-emerald-100 transition-all duration-300 group flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        <div className="flex gap-4 items-center">
                          {/* Avatar */}
                          <div className="relative shrink-0">
                            {friend.avatar_url ? (
                              <img 
                                src={friend.avatar_url} 
                                alt={friend.username} 
                                className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-sm"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                                {friend.first_name[0].toUpperCase()}
                              </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 bg-emerald-500 border-2 border-white w-4 h-4 rounded-full" />
                          </div>

                          <div className="min-w-0">
                            <h4 className="font-extrabold text-slate-900 group-hover:text-emerald-600 transition truncate">
                              {friend.first_name} {friend.last_name}
                            </h4>
                            <p className="text-xs text-slate-400 truncate">@{friend.username}</p>
                            <span className="inline-block mt-1 bg-slate-50 text-slate-500 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {friend.role}
                            </span>
                          </div>
                        </div>

                        <p className="text-slate-500 text-xs line-clamp-2 italic min-h-[2rem]">
                          {friend.bio ? `"${friend.bio}"` : '“No bio provided yet.”'}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-50 flex gap-2">
                        <button 
                          onClick={() => showNotification('success', `Starting battle with ${friend.first_name}...`)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs transition-colors"
                        >
                          <MessageSquare size={13} /> Chat
                        </button>
                        <button 
                          onClick={() => handleUnfriendClick(friend.uuid, `${friend.first_name} ${friend.last_name}`)}
                          className="px-3 py-2.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors"
                          title="Unfriend"
                        >
                          <UserX size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* TAB 2: PENDING REQUESTS */}
            {activeTab === 'pending' && (
              pendingRequests.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-xl mx-auto p-8 space-y-4">
                  <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mx-auto shadow-inner">
                    <Clock size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">No Pending Requests</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto">
                    When someone sends you a friend request, it will appear here. Share your username so friends can find you!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingRequests.map((request) => (
                    <div 
                      key={request.request_id}
                      className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        <div className="flex gap-4 items-center">
                          {/* Avatar */}
                          <div className="relative shrink-0">
                            {request.avatar_url ? (
                              <img 
                                src={request.avatar_url} 
                                alt={request.username} 
                                className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-sm"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                                {request.first_name[0].toUpperCase()}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <h4 className="font-extrabold text-slate-900 truncate">
                              {request.first_name} {request.last_name}
                            </h4>
                            <p className="text-xs text-slate-400 truncate">@{request.username}</p>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {request.direction === 'incoming' ? 'Received ' : 'Sent '} {new Date(request.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <p className="text-slate-500 text-xs line-clamp-2 italic min-h-[2rem]">
                          {request.bio ? `"${request.bio}"` : '“Hey there! I want to study together.”'}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-50 flex gap-2">
                        {request.direction === 'incoming' ? (
                          <>
                            <button 
                              onClick={() => handleRespondRequest(request.request_id, true)}
                              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition shadow-md shadow-emerald-100 active:scale-95"
                            >
                              <Check size={14} /> Accept
                            </button>
                            <button 
                              onClick={() => handleRespondRequest(request.request_id, false)}
                              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold rounded-xl text-xs transition active:scale-95"
                            >
                              <X size={14} /> Decline
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => handleUnfriendClick(request.uuid, `${request.first_name} ${request.last_name}`)}
                            className="w-full flex items-center justify-center gap-1.5 px-4 py-3 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 font-bold rounded-xl text-xs transition-colors active:scale-95"
                          >
                            <Clock size={14} className="text-amber-500" /> Cancel Request
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* TAB 3: FIND PEOPLE */}
            {activeTab === 'find' && (
              <div className="space-y-6">
                
                {/* Search Bar */}
                <div className="relative max-w-xl mx-auto">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search by exact username or email..." 
                    value={searchQuery}
                    onChange={(e) => handleSearchUsers(e.target.value)}
                    className="w-full pl-12 pr-10 py-4 bg-white text-slate-800 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-emerald-400 focus:outline-none placeholder-slate-400 shadow-md border border-slate-100"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-emerald-500" size={18} />
                  )}
                </div>

                {/* Search Results */}
                {searchQuery.trim() === '' ? (
                  <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200 max-w-xl mx-auto p-8 space-y-4">
                    <Search className="mx-auto text-slate-300" size={40} />
                    <h4 className="font-bold text-slate-700">Find classmates and teachers</h4>
                    <p className="text-slate-500 text-xs max-w-xs mx-auto">
                      Enter an exact username or email address to find and connect with people you know.
                    </p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-xl mx-auto p-8 space-y-3">
                    <AlertCircle className="mx-auto text-rose-400" size={40} />
                    <h4 className="font-bold text-slate-900 text-lg">No matches found</h4>
                    <p className="text-slate-500 text-xs max-w-xs mx-auto">
                      We couldn't find an exact match for "{searchQuery}". Make sure to enter their full username or email.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchResults.map((user) => {
                      const isFriend = user.friendship_status === 'accepted';
                      const isPending = user.friendship_status === 'pending';
                      const iSentIt = user.friendship_sender === currentUserId;

                      return (
                        <div 
                          key={user.uuid}
                          className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300"
                        >
                          <div className="space-y-4">
                            <div className="flex gap-4 items-center">
                              {/* Avatar */}
                              <div className="relative shrink-0">
                                {user.avatar_url ? (
                                  <img 
                                    src={user.avatar_url} 
                                    alt={user.username} 
                                    className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-sm"
                                  />
                                ) : (
                                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                                    {user.first_name[0].toUpperCase()}
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0">
                                <h4 className="font-extrabold text-slate-900 truncate">
                                  {user.first_name} {user.last_name}
                                </h4>
                                <p className="text-xs text-slate-400 truncate">@{user.username}</p>
                                <span className="inline-block mt-1 bg-indigo-50 text-indigo-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  {user.role}
                                </span>
                              </div>
                            </div>

                            <p className="text-slate-500 text-xs line-clamp-2 italic min-h-[2rem]">
                              {user.bio ? `"${user.bio}"` : '“No bio yet.”'}
                            </p>
                          </div>

                          <div className="mt-6 pt-4 border-t border-slate-50">
                            {isFriend ? (
                              <button 
                                onClick={() => handleUnfriendClick(user.uuid, `${user.first_name} ${user.last_name}`)}
                                className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold rounded-xl text-xs transition-colors"
                              >
                                <UserCheck size={14} className="text-emerald-500" /> Friends (Click to Unfriend)
                              </button>
                            ) : isPending ? (
                              iSentIt ? (
                                <button 
                                  onClick={() => handleUnfriendClick(user.uuid, `${user.first_name} ${user.last_name}`)}
                                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 font-bold rounded-xl text-xs transition-colors"
                                >
                                  <Clock size={14} className="text-amber-500" /> Request Sent (Cancel)
                                </button>
                              ) : (
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => loadFriendsAndPending().then(() => setActiveTab('pending'))}
                                    className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition"
                                  >
                                    Respond to Request
                                  </button>
                                </div>
                              )
                            ) : (
                              <button 
                                onClick={() => handleSendRequestFromSearch(user.uuid, user.username)}
                                className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition shadow-md shadow-emerald-100"
                              >
                                <UserPlus size={14} /> Add Friend
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirm Modal */}
      {confirmModal?.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full mx-auto shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-500" />
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-4 border border-rose-100 shadow-sm">
              <UserX size={32} />
            </div>
            <h3 className="text-xl font-extrabold text-center text-slate-900 mb-2">Are you sure?</h3>
            <p className="text-center text-slate-500 text-sm mb-8 px-2">
              Do you really want to unfriend or cancel the request for <strong className="text-slate-800">{confirmModal.friendName}</strong>?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmModal(null)}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm transition-colors active:scale-95"
              >
                Keep
              </button>
              <button 
                onClick={executeUnfriend}
                className="flex-1 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl text-sm transition-colors shadow-md shadow-rose-200 active:scale-95"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
