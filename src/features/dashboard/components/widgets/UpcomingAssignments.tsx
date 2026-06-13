import { FileText, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboard.service';
import { SharedExamTakerModal } from '@/features/exams/components/SharedExamTakerModal';
import { examsService, Exam } from '@/features/groups/services/exams.service';
import { StaggerContainer, StaggerItem } from '@/shared/components/animations/StaggerContainer';
import { Button } from '@/components/ui/Button';

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  groupName: string;
  type: string;
  isUrgent: boolean;
}

export function UpcomingAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(false);

  const loadAssignments = () => {
    dashboardService.getStudentAssignments()
      .then((res) => setAssignments((res as { data: Assignment[] }).data))
      .catch(console.error);
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleStartExam = async (examId: string) => {
    setLoading(true);
    try {
      const res = await examsService.getExamById(examId);
      const exam = (res as { data?: Exam }).data ?? (res as Exam);
      setSelectedExam(exam);
    } catch (e) {
      console.error('Failed to load exam:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseExam = () => {
    setSelectedExam(null);
    loadAssignments();
  };

  return (
    <>
      <div className="double-bezel h-full">
        <div className="double-bezel-inner bg-surface p-6 h-full flex flex-col hover:shadow-lg transition-fluid">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-lg">
              <FileText className="text-blue-500" size={20} />
              Upcoming Assignments
            </h3>
            <button className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">View All</button>
          </div>

          <StaggerContainer className="space-y-3">
            {assignments.length === 0 && (
              <StaggerItem className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-500 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 size={24} />
                </div>
                <p className="font-bold text-slate-700 dark:text-slate-300">All caught up!</p>
                <p className="text-xs text-slate-500 mt-1">You have no upcoming assignments.</p>
              </StaggerItem>
            )}
            {assignments.map((assignment) => (
              <StaggerItem key={assignment.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition-colors cursor-pointer ${assignment.isUrgent ? 'border-red-100 dark:border-red-900/50 bg-red-50/30 dark:bg-red-900/20 hover:bg-red-50/80 dark:hover:bg-red-900/40' : 'border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${assignment.type === 'exam' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : assignment.type === 'quiz' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                      {assignment.type}
                    </span>
                    {assignment.isUrgent && <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400"><AlertCircle size={12}/> Urgent</span>}
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">{assignment.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{assignment.groupName}</p>
                </div>
                
                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 mt-2 sm:mt-0">
                  <div className={`flex items-center gap-1 text-xs font-bold ${assignment.isUrgent ? 'text-red-500 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    <Clock size={14} /> {new Date(assignment.dueDate).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (assignment.type === 'exam') {
                        handleStartExam(assignment.id);
                      }
                    }}
                    disabled={loading}
                    size="sm"
                    variant={assignment.isUrgent ? 'danger' : 'primary'}
                    className={`rounded-lg ${!assignment.isUrgent ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : ''}`}
                  >
                    {loading ? 'Loading...' : 'Start'}
                  </Button>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>

      {selectedExam && (
        <SharedExamTakerModal 
          exam={selectedExam}
          onClose={handleCloseExam}
          mode="take"
        />
      )}
    </>
  );
}
