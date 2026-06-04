import { useState, useCallback, useEffect } from 'react';
import { groupsService } from '../services/groups.service';
import { Group, GroupMember } from '../types/groups.types';
import toast from 'react-hot-toast';

export function useGroupManager(queryGroupId?: string | null) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const res = await groupsService.getGroups();
      setGroups(res.data || []);
    } catch {
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMembers = useCallback(async (groupId: string) => {
    try {
      const res = await groupsService.getGroupMembers(groupId);
      setMembers(res.data || []);
    } catch {
      toast.error('Failed to load members');
    }
  }, []);

  const handleSelectGroup = useCallback((group: Group | null) => {
    setSelectedGroup(group);
    if (group) {
      fetchMembers(group.id);
    } else {
      setMembers([]);
    }
  }, [fetchMembers]);

  // Initial load
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Handle URL query parameter
  useEffect(() => {
    if (queryGroupId && groups.length > 0) {
      const found = groups.find((g) => g.id === queryGroupId);
      if (found) {
        handleSelectGroup(found);
      }
    }
  }, [queryGroupId, groups, handleSelectGroup]);

  const saveGroup = async (
    editingGroup: Group | null,
    groupForm: { title: string; description: string },
    avatarFile: File | null
  ) => {
    try {
      if (editingGroup) {
        const updateRes = await groupsService.updateGroup(editingGroup.id, {
          title: groupForm.title,
          description: groupForm.description,
        });
        let updatedGroup: Group = updateRes.data || (updateRes as unknown as Group);

        if (avatarFile) {
          const avatarRes = await groupsService.uploadAvatar(editingGroup.id, avatarFile);
          updatedGroup = avatarRes.data || (avatarRes as unknown as Group);
        }

        toast.success('Group updated successfully');
        if (selectedGroup?.id === editingGroup.id) {
          setSelectedGroup(updatedGroup);
        }
      } else {
        const createRes = await groupsService.createGroup({
          title: groupForm.title,
          description: groupForm.description,
        });
        const newGroup: Group = createRes.data || (createRes as unknown as Group);

        if (avatarFile && newGroup?.id) {
          await groupsService.uploadAvatar(newGroup.id, avatarFile);
        }

        toast.success('Group created successfully');
      }
      fetchGroups();
      return true;
    } catch {
      toast.error('Failed to save group');
      return false;
    }
  };

  const deleteGroup = async (groupId: string) => {
    try {
      await groupsService.deleteGroup(groupId);
      toast.success('Group deleted');
      if (selectedGroup?.id === groupId) {
        setSelectedGroup(null);
      }
      fetchGroups();
      return true;
    } catch {
      toast.error('Failed to delete group');
      return false;
    }
  };

  const addMember = async (groupId: string, memberIdentifier: string) => {
    try {
      await groupsService.addMember(groupId, memberIdentifier);
      toast.success('Member added');
      fetchMembers(groupId);
      return true;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to add member';
      toast.error(msg);
      return false;
    }
  };

  const removeMember = async (groupId: string, userId: string) => {
    try {
      await groupsService.removeMember(groupId, userId);
      toast.success('Member removed');
      fetchMembers(groupId);
      return true;
    } catch {
      toast.error('Failed to remove member');
      return false;
    }
  };

  return {
    groups,
    selectedGroup,
    members,
    loading,
    handleSelectGroup,
    saveGroup,
    deleteGroup,
    addMember,
    removeMember,
  };
}
