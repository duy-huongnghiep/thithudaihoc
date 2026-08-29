import React, { useState } from 'react';
import {
  LogOut,
  ChevronRight,
  GraduationCap,
  Brain,
  BookOpenCheck,
  IdCard,
  ChevronDown,
  Info,
  ExternalLink,
  Copy,
  Check,
  Play,
} from 'lucide-react';
import { isYes } from '../services/api';
import { EXAM_GROUPS, EXAM_TIPS } from '../data/examsData';
import { ExamSection, StudentInfo } from '../types';
import { ExamBadges } from './Badges';
import { ExamLauncherModal } from './ExamLauncherModal';
import { BookOpen } from 'lucide-react';

interface StudentDashboardProps {
  student: StudentInfo;
  onLogout: () => void;
  onOpenGuide?: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  onLogout,
  onOpenGuide,
}) => {
  const [showExams, setShowExams] = useState(true);
  const [showTips, setShowTips] = useState(false);
  const [selectedExamForModal, setSelectedExamForModal] = useState<{
    section: ExamSection;
    categoryName: string;
  } | null>(null);
  const [copiedSbd, setCopiedSbd] = useState(false);

  const hasHsa = isYes(student.hsa);
  const hasVact = isYes(student.vact);
  const hasThptqg = isYes(student.thptqg);
  const hasAnyExam = hasHsa || hasVact || hasThptqg;

  const handleCopySbd = () => {
    if (!student.sbd) return;
    navigator.clipboard.writeText(student.sbd);
    setCopiedSbd(true);
    setTimeout(() => setCopiedSbd(false), 2000);
  };

  return (
    <div id="student-dashboard-section" className="space-y-4">
      {/* Student Profile Card */}
      <div className="bg-[#0b0e1a] border border-[#1f2747] p-4 rounded-2xl space-y-3 text-xs shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
              <IdCard className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
                Thí sinh
              </span>
              <span id="display-student-name" className="font-bold text-white text-sm">
                {student.hoten || 'Chưa cập nhật'}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
              Số Báo Danh
            </span>
            <div className="flex items-center gap-1.5 justify-end">
              <span id="display-student-sbd" className="font-mono font-bold text-blue-400 text-sm">
                {student.sbd || '---'}
              </span>
              {student.sbd && (
                <button
                  type="button"
                  onClick={handleCopySbd}
                  className="text-slate-500 hover:text-blue-400 transition"
                  title="Sao chép SBD"
                >
                  {copiedSbd ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Details row */}
        <div className="space-y-2 pt-1">
          {student.email && (
            <div className="flex justify-between items-center text-slate-400 border-b border-slate-800/40 pb-1.5">
              <span>Email:</span>
              <span className="text-slate-300 font-medium">{student.email}</span>
            </div>
          )}

          {student.namsinh && (
            <div className="flex justify-between items-center text-slate-400 border-b border-slate-800/40 pb-1.5">
              <span>Năm sinh:</span>
              <span className="text-slate-300 font-medium">{student.namsinh}</span>
            </div>
          )}

          <div className="pt-0.5">
            <span className="text-slate-400 block mb-1.5 text-[11px] font-semibold">
              Kỳ thi đã đăng ký:
            </span>
            <ExamBadges student={student} size="sm" />
          </div>
        </div>
      </div>

      {/* Main Exam Action Button */}
      {!showExams ? (
        <button
          type="button"
          id="btn-show-exam-selection"
          onClick={() => setShowExams(true)}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer active:scale-[0.98]"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Bắt Đầu Làm Bài Thi</span>
        </button>
      ) : (
        <div id="exam-catalog" className="space-y-4 pt-1">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>Danh sách môn thi của bạn</span>
            </h2>
            <button
              type="button"
              id="btn-toggle-exam-view"
              onClick={() => setShowExams(false)}
              className="text-xs text-slate-500 hover:text-slate-300 transition cursor-pointer"
            >
              Thu gọn
            </button>
          </div>

          {!hasAnyExam ? (
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl text-center space-y-2">
              <p className="text-xs text-slate-400">
                Tài khoản của bạn hiện chưa được ghi nhận đăng ký môn thi nào.
              </p>
              <a
                href="https://forms.gle/wMqrZrqWD4RL68Az8"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-amber-400 hover:underline font-semibold"
              >
                <span>Bấm vào đây để đăng ký kỳ thi</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : (
            <div className="space-y-3.5">
              {/* 1. HSA EXAM CATEGORY */}
              {hasHsa && (
                <div
                  id="exam-group-hsa"
                  className="space-y-2 p-3.5 bg-[#0e1224] rounded-2xl border border-blue-500/30 hover:border-blue-500/50 transition shadow-md"
                >
                  <div className="font-bold text-xs text-blue-400 uppercase tracking-wider flex items-center justify-between border-b border-blue-500/20 pb-2">
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4" />
                      <span>Kỳ Thi ĐGNL HSA (ĐHQGHN)</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                      3 Phần thi
                    </span>
                  </div>

                  <div className="space-y-2 pt-1">
                    {EXAM_GROUPS.hsa.sections.map((section) => (
                      <div
                        key={section.id}
                        id={`btn-open-${section.id}`}
                        onClick={() =>
                          setSelectedExamForModal({
                            section,
                            categoryName: 'Kỳ thi ĐGNL HSA',
                          })
                        }
                        className="group flex items-center justify-between p-2.5 bg-[#0b0e1a] hover:bg-[#141a30] border border-slate-800 hover:border-blue-500/60 rounded-xl text-xs transition cursor-pointer"
                      >
                        <div className="space-y-0.5">
                          <div className="font-semibold text-white group-hover:text-blue-300 transition flex items-center gap-1.5">
                            <span>{section.title}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span>{section.subtitle}</span>
                            <span className="text-slate-600">•</span>
                            <span className="font-mono text-blue-400/90 font-medium">
                              {section.durationMinutes} phút
                            </span>
                          </div>
                        </div>
                        <div className="w-7 h-7 rounded-lg bg-slate-800/80 group-hover:bg-blue-600 text-slate-400 group-hover:text-white flex items-center justify-center transition shrink-0 ml-2">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. VACT EXAM CATEGORY */}
              {hasVact && (
                <div
                  id="exam-group-vact"
                  className="space-y-2 p-3.5 bg-[#0e1224] rounded-2xl border border-emerald-500/30 hover:border-emerald-500/50 transition shadow-md"
                >
                  <div className="font-bold text-xs text-emerald-400 uppercase tracking-wider flex items-center justify-between border-b border-emerald-500/20 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Brain className="w-4 h-4" />
                      <span>Kỳ Thi ĐGNL VACT (ĐHQG-HCM)</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      3 Phần thi
                    </span>
                  </div>

                  <div className="space-y-2 pt-1">
                    {EXAM_GROUPS.vact.sections.map((section) => (
                      <div
                        key={section.id}
                        id={`btn-open-${section.id}`}
                        onClick={() =>
                          setSelectedExamForModal({
                            section,
                            categoryName: 'Kỳ thi ĐGNL VACT',
                          })
                        }
                        className="group flex items-center justify-between p-2.5 bg-[#0b0e1a] hover:bg-[#141a30] border border-slate-800 hover:border-emerald-500/60 rounded-xl text-xs transition cursor-pointer"
                      >
                        <div className="space-y-0.5">
                          <div className="font-semibold text-white group-hover:text-emerald-300 transition">
                            {section.title}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span>{section.subtitle}</span>
                            <span className="text-slate-600">•</span>
                            <span className="font-mono text-emerald-400/90 font-medium">
                              {section.durationMinutes} phút
                            </span>
                          </div>
                        </div>
                        <div className="w-7 h-7 rounded-lg bg-slate-800/80 group-hover:bg-emerald-600 text-slate-400 group-hover:text-white flex items-center justify-center transition shrink-0 ml-2">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. THPTQG EXAM CATEGORY */}
              {hasThptqg && (
                <div
                  id="exam-group-thptqg"
                  className="space-y-2 p-3.5 bg-[#0e1224] rounded-2xl border border-purple-500/30 hover:border-purple-500/50 transition shadow-md"
                >
                  <div className="font-bold text-xs text-purple-400 uppercase tracking-wider flex items-center justify-between border-b border-purple-500/20 pb-2">
                    <span className="flex items-center gap-1.5">
                      <BookOpenCheck className="w-4 h-4" />
                      <span>Kỳ Thi THPT Quốc Gia</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                      4 Môn thi
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {EXAM_GROUPS.thptqg.sections.map((section) => (
                      <div
                        key={section.id}
                        id={`btn-open-${section.id}`}
                        onClick={() =>
                          setSelectedExamForModal({
                            section,
                            categoryName: 'Kỳ thi THPTQG',
                          })
                        }
                        className="group p-2.5 bg-[#0b0e1a] hover:bg-[#141a30] border border-slate-800 hover:border-purple-500/60 rounded-xl text-xs transition cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="font-semibold text-white group-hover:text-purple-300 transition">
                            {section.title}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Thời gian: {section.durationMinutes} phút
                          </div>
                        </div>
                        <div className="mt-2 pt-1 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-purple-400 font-medium">
                          <span>Vào thi</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Rules & Tips Accordion and Exam Guide */}
      <div className="space-y-2">
        {onOpenGuide && (
          <button
            type="button"
            id="btn-dashboard-open-guide"
            onClick={onOpenGuide}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 hover:from-blue-900/50 hover:to-indigo-900/50 text-blue-300 border border-blue-500/25 rounded-2xl transition text-xs flex items-center justify-between group cursor-pointer"
          >
            <span className="flex items-center gap-2 font-semibold">
              <BookOpen className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition" />
              <span>Tìm hiểu cấu trúc & cẩm nang các kỳ thi</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition" />
          </button>
        )}

        <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-[#0b0e1a]/60">
          <button
            type="button"
            id="btn-toggle-tips"
            onClick={() => setShowTips(!showTips)}
            className="w-full p-3 flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span>Lưu ý & Quy chế phòng thi</span>
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                showTips ? 'rotate-180 text-blue-400' : ''
              }`}
            />
          </button>

          {showTips && (
            <div className="px-3.5 pb-3 text-[11px] text-slate-400 space-y-1.5 border-t border-slate-800/60 pt-2 animate-fadeIn">
              {EXAM_TIPS.map((tip, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Logout Action */}
      <div className="pt-2">
        <button
          type="button"
          id="btn-logout"
          onClick={onLogout}
          className="w-full py-2.5 text-xs text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition text-center flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Đăng xuất tài khoản</span>
        </button>
      </div>

      {/* Exam Launcher Confirmation Modal */}
      {selectedExamForModal && (
        <ExamLauncherModal
          section={selectedExamForModal.section}
          categoryName={selectedExamForModal.categoryName}
          onClose={() => setSelectedExamForModal(null)}
        />
      )}
    </div>
  );
};
