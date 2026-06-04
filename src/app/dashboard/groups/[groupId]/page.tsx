'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile } from '@/features/auth/services/auth.service';
import { Loader2 } from 'lucide-react';
import { TeacherGroupDetail } from '@/features/dashboard/components/teacher/TeacherGroupDetail';
import { StudentGroupDetail } from '@/features/dashboard/components/student/StudentGroupDetail';

export default function GroupDetailPage({ params }: { params: Promise<{ groupId: string }> }) {
  const router = useRouter();
  const { groupId } = use(params);
  const [role, setRole] = useState<'student' | 'teacher' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then((res) => {
        const user = res.data || res;
        if (user.role === 'admin') {
          router.push('/dashboard/admin');
        } else {
          setRole(user.role || 'student');
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch profile', err);
        setRole('student');
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full">
      {role === 'teacher' ? (
        <TeacherGroupDetail groupId={groupId} />
      ) : (
        <StudentGroupDetail groupId={groupId} />
      )}
    </div>
  );
}
