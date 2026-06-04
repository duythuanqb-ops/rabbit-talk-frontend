'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus, Swords, Loader2 } from 'lucide-react';
import { groupsService } from '@/features/groups/services/groups.service';
import { Group } from '@/features/groups/types/groups.types';

export function TeacherClassesWidget() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    groupsService.getGroups()
      .then((res) => {
        setGroups(res.data || []);
      })
      .catch((err) => {
        console.error('Failed to load groups for dashboard', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="double-bezel">
      <div className="double-bezel-inner bg-surface p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-foreground text-lg">My Classes</h3>
            <p className="text-muted-foreground text-sm">Select a class to manage or start a Live Battle.</p>
          </div>
          <button 
            onClick={() => router.push('/dashboard/groups')}
            className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
          >
            <Plus size={14} /> Create Class
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-emerald-500" size={24} />
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-12 bg-surface-hover rounded-2xl border border-dashed border-border/60">
            <Users className="mx-auto text-muted-foreground/50 mb-3" size={36} />
            <p className="text-muted-foreground font-medium text-sm">No classes created yet</p>
            <button 
              onClick={() => router.push('/dashboard/groups')}
              className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition shadow-[0_4px_14px_rgba(16,185,129,0.4)]"
            >
              Create Your First Class
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((group) => (
              <div 
                key={group.id}
                onClick={() => router.push(`/dashboard/groups?groupId=${group.id}`)}
                className="p-5 rounded-2xl border border-border/50 bg-surface-hover/50 hover:border-emerald-500/30 hover:shadow-md hover:bg-surface transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-3 items-start mb-3">
                    {group.avatar ? (
                      <img 
                        src={group.avatar} 
                        alt={group.title} 
                        className="w-10 h-10 rounded-xl object-cover border border-border shadow-sm flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                        {group.title[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate pr-2 text-base">
                          {group.title}
                        </h4>
                        <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0">
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {group.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-border/50 mt-auto">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">
                    Click to manage &rarr;
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/battle?groupId=${group.id}&groupName=${encodeURIComponent(group.title)}`);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white hover:bg-emerald-600 font-bold rounded-lg text-xs transition-colors shadow-sm"
                  >
                    <Swords size={12} /> Battle
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
