'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, Plus, FileText, BarChart3, ChevronLeft, BookOpen, Clock, Play, Swords, Trash2, Edit, Loader2, UserPlus, UserMinus, Settings } from 'lucide-react';
import { groupsService } from '../../../groups/services/groups.service';
import { Group, GroupMember } from '../../../groups/types/groups.types';
import toast from 'react-hot-toast';
import { ConfirmModal } from '@/shared/components/ConfirmModal';

export function TeacherGroupManager() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryGroupId = searchParams ? searchParams.get('groupId') : null;
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  
  // Form state
  const [groupForm, setGroupForm] = useState({ title: '', description: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [memberEmail, setMemberEmail] = useState(''); // Just for simplicity, using a generic user_id field
  const [memberIdentifier, setMemberIdentifier] = useState(''); 
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const triggerConfirm = (options: {
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }) => {
    setConfirmState({
      isOpen: true,
      ...options,
    });
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (queryGroupId && groups.length > 0) {
      const found = groups.find(g => g.id === queryGroupId);
      if (found) {
        handleSelectGroup(found);
      }
    }
  }, [queryGroupId, groups]);

  const handleGoBack = () => {
    setSelectedGroup(null);
    router.push('/dashboard/groups');
  };

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await groupsService.getGroups();
      setGroups(res.data || []);
    } catch (error) {
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async (groupId: string) => {
    try {
      const res = await groupsService.getGroupMembers(groupId);
      console.log('Group members response data:', res.data);
      setMembers(res.data || []);
    } catch (error) {
      toast.error('Failed to load members');
    }
  };

  const handleSelectGroup = (group: Group) => {
    setSelectedGroup(group);
    fetchMembers(group.id);
  };

  const handleStartBattle = (groupId: string, groupName: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    router.push(`/dashboard/battle?groupId=${groupId}&groupName=${encodeURIComponent(groupName)}`);
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGroup) {
        // 1. Update text fields
        const updateRes = await groupsService.updateGroup(editingGroup.id, { 
          title: groupForm.title, 
          description: groupForm.description 
        });
        let updatedGroup = updateRes.data || updateRes as any;

        // 2. Upload avatar if selected
        if (avatarFile) {
          const avatarRes = await groupsService.uploadAvatar(editingGroup.id, avatarFile);
          updatedGroup = avatarRes.data || avatarRes as any;
        }

        toast.success('Group updated successfully');
        if (selectedGroup?.id === editingGroup.id) {
          setSelectedGroup(updatedGroup);
        }
      } else {
        // 1. Create group first
        const createRes = await groupsService.createGroup({ 
          title: groupForm.title, 
          description: groupForm.description 
        });
        const newGroup = createRes.data || createRes as any;

        // 2. Upload avatar if selected
        if (avatarFile && newGroup?.id) {
          await groupsService.uploadAvatar(newGroup.id, avatarFile);
        }

        toast.success('Group created successfully');
      }
      setIsGroupModalOpen(false);
      fetchGroups();
    } catch (error) {
      toast.error('Failed to save group');
    }
  };

  const handleDeleteGroup = (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerConfirm({
      title: 'Delete Class',
      message: 'Are you sure you want to delete this class? This action cannot be undone and all student memberships will be removed.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await groupsService.deleteGroup(groupId);
          toast.success('Group deleted');
          if (selectedGroup?.id === groupId) setSelectedGroup(null);
          fetchGroups();
        } catch (error) {
          toast.error('Failed to delete group');
        }
      }
    });
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;
    try {
      await groupsService.addMember(selectedGroup.id, memberIdentifier);
      toast.success('Member added');
      setMemberIdentifier('');
      fetchMembers(selectedGroup.id);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = (userId: string) => {
    if (!selectedGroup) return;
    triggerConfirm({
      title: 'Remove Member',
      message: 'Are you sure you want to remove this member from the class?',
      type: 'danger',
      onConfirm: async () => {
        try {
          await groupsService.removeMember(selectedGroup.id, userId);
          toast.success('Member removed');
          fetchMembers(selectedGroup.id);
        } catch (error) {
          toast.error('Failed to remove member');
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-emerald-500 w-8 h-8" />
      </div>
    );
  }

  if (selectedGroup) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative">
        {/* Modals */}
        {isGroupModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
             <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
               <h3 className="text-xl font-bold mb-4 text-slate-800">{editingGroup ? 'Edit Group' : 'Create Group'}</h3>
               <form onSubmit={handleSaveGroup} className="space-y-4">
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1">Group Title</label>
                   <input required type="text" value={groupForm.title} onChange={e => setGroupForm({...groupForm, title: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-800" placeholder="e.g. Advanced English" />
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1">Description (Optional)</label>
                   <textarea value={groupForm.description} onChange={e => setGroupForm({...groupForm, description: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none text-slate-800" rows={3} placeholder="Group description..." />
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1">Group Avatar</label>
                   <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                     <div className="relative group flex-shrink-0">
                       {avatarPreview ? (
                         <img 
                           src={avatarPreview} 
                           alt="Avatar preview" 
                           className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm"
                         />
                       ) : (
                         <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold text-xl shadow-inner">
                           {groupForm.title ? groupForm.title[0].toUpperCase() : 'G'}
                         </div>
                       )}
                     </div>
                     <div className="flex-1 min-w-0">
                       <input 
                         type="file" 
                         accept="image/*" 
                         onChange={(e) => {
                           const file = e.target.files?.[0];
                           if (file) {
                             setAvatarFile(file);
                             setAvatarPreview(URL.createObjectURL(file));
                           }
                         }} 
                         className="hidden" 
                         id="detail-group-avatar-upload"
                       />
                       <label 
                         htmlFor="detail-group-avatar-upload" 
                         className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold rounded-lg text-xs transition-colors cursor-pointer shadow-sm"
                       >
                         Choose Image
                       </label>
                       <p className="text-[9px] text-slate-400 mt-1 truncate">Recommended: Square, max 5MB</p>
                     </div>
                   </div>
                 </div>
                 <div className="flex justify-end gap-3 pt-4">
                   <button type="button" onClick={() => setIsGroupModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                   <button type="submit" className="px-4 py-2 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200">Save Group</button>
                 </div>
               </form>
             </div>
          </div>
        )}
        
        {isMemberModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
             <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
               <h3 className="text-xl font-bold mb-4 text-slate-800">Add Member</h3>
               <form onSubmit={handleAddMember} className="space-y-4">
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1">Username or Email</label>
                   <input required type="text" value={memberIdentifier} onChange={e => setMemberIdentifier(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-800" placeholder="Enter student username or email" />
                 </div>
                 <div className="flex justify-end gap-3 pt-4">
                   <button type="button" onClick={() => setIsMemberModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                   <button type="submit" className="px-4 py-2 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200">Add Member</button>
                 </div>
               </form>
             </div>
          </div>
        )}

        {/* Detail view header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleGoBack}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-700"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center gap-4">
              {selectedGroup.avatar ? (
                <img 
                  src={selectedGroup.avatar} 
                  alt={selectedGroup.title} 
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-2xl shadow-md flex-shrink-0">
                  {selectedGroup.title[0].toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="font-bold text-slate-900 text-2xl tracking-tight">{selectedGroup.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{selectedGroup.description || 'No description provided'}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { 
                setEditingGroup(selectedGroup); 
                setGroupForm({ title: selectedGroup.title, description: selectedGroup.description || '' }); 
                setAvatarFile(null);
                setAvatarPreview(selectedGroup.avatar || null);
                setIsGroupModalOpen(true); 
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 font-bold rounded-xl transition-colors"
            >
              <Edit size={16} /> Edit
            </button>
            <button 
              onClick={(e) => handleDeleteGroup(selectedGroup.id, e)}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 font-bold rounded-xl transition-colors"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Live Battle Section */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/30 transition-colors duration-700" />
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                <div>
                  <h4 className="font-bold flex items-center gap-2 text-xl mb-2">
                    <Swords size={24} className="text-emerald-400" />
                    Live Vocab Battle
                  </h4>
                  <p className="text-sm text-white/70 max-w-sm leading-relaxed">
                    Start a real-time pronunciation battle for <span className="font-semibold text-white">{selectedGroup.title}</span>. Challenge your students and track their progress live.
                  </p>
                </div>
                <button 
                  onClick={() => handleStartBattle(selectedGroup.id, selectedGroup.title)}
                  className="flex items-center gap-2 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl transition-all font-bold shadow-lg shadow-emerald-900/30 whitespace-nowrap hover:scale-105 active:scale-95"
                >
                  <Play size={18} className="fill-white" />
                  Start Battle
                </button>
              </div>
            </div>

            {/* Empty States for Exams & Vocab (Since backend isn't ready for these) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="text-blue-500" size={18} />
                    Exams
                  </h4>
                </div>
                <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white">
                  <p className="text-sm text-slate-500 font-medium">Coming soon</p>
                </div>
              </div>
              <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2">
                    <BookOpen className="text-orange-500" size={18} />
                    Vocabulary
                  </h4>
                </div>
                <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white">
                  <p className="text-sm text-slate-500 font-medium">Coming soon</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            {/* Members Section */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm sticky top-6">
              <div className="flex items-center justify-between mb-5">
                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                  <Users className="text-indigo-500" size={18} />
                  Members ({members.length})
                </h4>
                <button 
                  onClick={() => setIsMemberModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors text-xs font-bold shadow-sm"
                >
                  <UserPlus size={14} />
                  Add
                </button>
              </div>
              
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {members.length > 0 ? members.map(member => (
                  <div key={member.uuid} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 group transition-all hover:bg-white hover:border-slate-200 hover:shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center font-bold text-indigo-600 border border-indigo-100">
                        {member.first_name?.[0]}{member.last_name?.[0]}
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800 text-sm">{member.first_name} {member.last_name}</h5>
                        <p className="text-xs text-slate-500">{member.username}</p>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const targetId = member.uuid || (member as any).user_id || (member as any).id;
                        handleRemoveMember(targetId);
                      }}
                      className="text-rose-500 hover:text-white p-2 rounded-lg bg-rose-50 hover:bg-rose-500 transition-all flex items-center justify-center shadow-sm hover:shadow active:scale-95"
                      title="Remove member"
                    >
                      <UserMinus size={16} />
                    </button>
                  </div>
                )) : (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100">
                      <Users size={20} className="text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500 font-medium">No members yet</p>
                    <button onClick={() => setIsMemberModalOpen(true)} className="mt-2 text-xs font-bold text-indigo-500 hover:text-indigo-600">Add first member</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <ConfirmModal
          isOpen={confirmState.isOpen}
          onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmState.onConfirm}
          title={confirmState.title}
          message={confirmState.message}
          type={confirmState.type}
        />
      </div>
    );
  }

  // List view
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative min-h-[400px]">
      {/* Group Modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
           <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
             <h3 className="text-xl font-bold mb-4 text-slate-800">{editingGroup ? 'Edit Group' : 'Create New Group'}</h3>
             <form onSubmit={handleSaveGroup} className="space-y-4">
               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-1">Group Title</label>
                 <input required type="text" value={groupForm.title} onChange={e => setGroupForm({...groupForm, title: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-800" placeholder="e.g. Advanced English" />
               </div>
               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-1">Description (Optional)</label>
                 <textarea value={groupForm.description} onChange={e => setGroupForm({...groupForm, description: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none text-slate-800" rows={3} placeholder="Group description..." />
               </div>
               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-1">Group Avatar</label>
                 <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                   <div className="relative group flex-shrink-0">
                     {avatarPreview ? (
                       <img 
                         src={avatarPreview} 
                         alt="Avatar preview" 
                         className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm"
                       />
                     ) : (
                       <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold text-xl shadow-inner">
                         {groupForm.title ? groupForm.title[0].toUpperCase() : 'G'}
                       </div>
                     )}
                   </div>
                   <div className="flex-1 min-w-0">
                     <input 
                       type="file" 
                       accept="image/*" 
                       onChange={(e) => {
                         const file = e.target.files?.[0];
                         if (file) {
                           setAvatarFile(file);
                           setAvatarPreview(URL.createObjectURL(file));
                         }
                       }} 
                       className="hidden" 
                       id="list-group-avatar-upload"
                     />
                     <label 
                       htmlFor="list-group-avatar-upload" 
                       className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold rounded-lg text-xs transition-colors cursor-pointer shadow-sm"
                     >
                       Choose Image
                     </label>
                     <p className="text-[9px] text-slate-400 mt-1 truncate">Recommended: Square, max 5MB</p>
                   </div>
                 </div>
               </div>
               <div className="flex justify-end gap-3 pt-4">
                 <button type="button" onClick={() => setIsGroupModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                 <button type="submit" className="px-4 py-2 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200">{editingGroup ? 'Save Changes' : 'Create Group'}</button>
               </div>
             </form>
           </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-900 text-xl flex items-center gap-3 tracking-tight">
          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
            <Users size={24} />
          </div>
          My Groups
        </h3>
        <button 
          onClick={() => { 
            setEditingGroup(null); 
            setGroupForm({ title: '', description: '' }); 
            setAvatarFile(null);
            setAvatarPreview(null);
            setIsGroupModalOpen(true); 
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all text-sm font-bold shadow-lg shadow-emerald-200 hover:scale-105 active:scale-95"
        >
          <Plus size={18} />
          Create Group
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
            <Users size={32} className="text-slate-300" />
          </div>
          <h4 className="text-lg font-bold text-slate-800 mb-1">No groups found</h4>
          <p className="text-slate-500 max-w-sm mb-6 text-sm">Create your first group to start managing students, assigning exams, and hosting live battles.</p>
          <button 
            onClick={() => { 
              setEditingGroup(null); 
              setGroupForm({ title: '', description: '' }); 
              setAvatarFile(null);
              setAvatarPreview(null);
              setIsGroupModalOpen(true); 
            }}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors text-sm font-bold border border-emerald-100"
          >
            <Plus size={18} />
            Create Your First Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups.map((group) => (
            <div 
              key={group.id}
              onClick={() => handleSelectGroup(group)}
              className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer bg-white hover:shadow-xl hover:-translate-y-1 group relative flex flex-col h-full"
            >
              <div className="absolute top-4 right-4">
                <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-colors">
                  <Settings size={14} />
                </div>
              </div>
              
              <div className="flex gap-4 items-start mb-4 pr-10">
                {group.avatar ? (
                  <img 
                    src={group.avatar} 
                    alt={group.title} 
                    className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-sm flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0">
                    {group.title[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors text-lg line-clamp-1">{group.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[32px]">{group.description || 'No description'}</p>
                </div>
              </div>
              
              <div className="mt-auto">
                <div className="flex gap-2 mt-4">
                  <div className="flex-1 py-2 bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-100 flex flex-col items-center justify-center gap-1">
                    <Users size={16} className="text-indigo-500" />
                    Manage
                  </div>
                  <button
                    onClick={(e) => handleStartBattle(group.id, group.title, e)}
                    className="flex-1 py-2 bg-slate-900 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex flex-col items-center justify-center gap-1 transition-colors shadow-sm"
                    title="Start Live Battle"
                  >
                    <Swords size={16} />
                    Battle
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        type={confirmState.type}
      />
    </div>
  );
}
