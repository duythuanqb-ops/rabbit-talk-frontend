'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Users, Plus, Swords, Loader2 } from 'lucide-react';
import { groupsService } from '@/features/groups/services/groups.service';
import { Group } from '@/features/groups/types/groups.types';
import { StaggerContainer, StaggerItem } from '@/shared/components/animations/StaggerContainer';
import { Button } from '@/components/ui/Button';

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
          <Button
            onClick={() => router.push('/dashboard/groups')}
            size="sm"
            variant="primary"
            className="rounded-xl"
            leftIcon={<Plus size={14} />}
          >
            Create Class
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-emerald-500" size={24} />
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-12 bg-surface-hover rounded-2xl border border-dashed border-border/60">
            <Users className="mx-auto text-muted-foreground/50 mb-3" size={36} />
            <p className="text-muted-foreground font-medium text-sm">No classes created yet</p>
            <Button
              onClick={() => router.push('/dashboard/groups')}
              className="mt-4 rounded-xl"
              variant="primary"
            >
              Create Your First Class
            </Button>
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((group) => (
              <StaggerItem 
                key={group.id}
                onClick={() => router.push(`/dashboard/groups?groupId=${group.id}`)}
                className="p-5 rounded-2xl border border-border/50 bg-surface-hover/50 hover:border-emerald-500/30 hover:shadow-md hover:bg-surface transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-3 items-start mb-3">
                    {group.avatar ? (
                      <Image 
                        unoptimized
                        src={group.avatar} 
                        alt={group.title} 
                        width={40}
                        height={40}
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
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/battle?groupId=${group.id}&groupName=${encodeURIComponent(group.title)}`);
                    }}
                    size="sm"
                    className="h-8 text-xs rounded-lg px-3"
                    leftIcon={<Swords size={12} />}
                  >
                    Battle
                  </Button>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </div>
  );
}
