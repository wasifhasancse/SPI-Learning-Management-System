"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useToast } from "@/components/ToastNotifications";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Course,
  Lecture,
  fetchCourses,
  fetchLectures,
  createLecture,
  updateLecture,
  deleteLecture,
  getJwtToken
} from "@/lib/api";
import { getEmbedVideoUrl } from "@/lib/videoHelper";
import AdminListSkeleton from "@/components/AdminListSkeleton";
import {
  HiPlus,
  HiPencilSquare,
  HiTrash,
  HiVideoCamera,
  HiPlay,
  HiMagnifyingGlass,
  HiFunnel,
  HiXMark,
  HiBookOpen,
  HiArrowTopRightOnSquare,
  HiBarsArrowUp
} from "react-icons/hi2";

function LecturesManager() {
  const toast = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCourseId = searchParams.get("courseId") || "all";

  const [courses, setCourses] = useState<Course[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>(initialCourseId);
  const [searchQuery, setSearchQuery] = useState("");

  // Active embedded preview
  const [previewLectureId, setPreviewLectureId] = useState<number | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);
  const [deleteConfirmLecture, setDeleteConfirmLecture] = useState<Lecture | null>(null);
  const [modalSubmitting, setModalSubmitting] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    course_id: "",
    title: "",
    description: "",
    video_url: "",
    order_index: "1"
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const [coursesData, lecturesData] = await Promise.all([
        fetchCourses(),
        fetchLectures()
      ]);
      setCourses(coursesData);
      setLectures(lecturesData);
    } catch (err: any) {
      console.error("Failed to load lecture management data:", err);
      setLoadError(true);
      toast.danger(err.message || "Failed to load courses or lectures from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!isModalOpen && !deleteConfirmLecture) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !modalSubmitting) {
        setIsModalOpen(false);
        setDeleteConfirmLecture(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, deleteConfirmLecture, modalSubmitting]);

  // Update filter if query param changes
  useEffect(() => {
    const courseIdParam = searchParams.get("courseId");
    if (courseIdParam) {
      setSelectedCourseFilter(courseIdParam);
    }
  }, [searchParams]);

  // Filtered lectures
  const filteredLectures = useMemo(() => {
    return lectures.filter((l) => {
      // Course filter
      if (selectedCourseFilter !== "all" && l.course_id.toString() !== selectedCourseFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = l.title.toLowerCase().includes(q);
        const matchesDesc = (l.description || "").toLowerCase().includes(q);
        const matchesCourse = (l.course_title || "").toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCourse) {
          return false;
        }
      }
      return true;
    });
  }, [lectures, selectedCourseFilter, searchQuery]);

  // Open Create Modal
  const openCreateModal = (defaultCourseId?: number | string) => {
    const targetCourseId = defaultCourseId
      ? defaultCourseId.toString()
      : selectedCourseFilter !== "all"
      ? selectedCourseFilter
      : courses[0]?.id?.toString() || "";

    // Determine next order index for this course
    const existingForCourse = lectures.filter((l) => l.course_id.toString() === targetCourseId);
    const maxOrder = existingForCourse.reduce((max, l) => Math.max(max, l.order_index || 0), 0);

    setEditingLecture(null);
    setFormData({
      course_id: targetCourseId,
      title: "",
      description: "",
      video_url: "",
      order_index: (maxOrder + 1).toString()
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (lecture: Lecture) => {
    setEditingLecture(lecture);
    setFormData({
      course_id: lecture.course_id.toString(),
      title: lecture.title,
      description: lecture.description || "",
      video_url: lecture.video_url || "",
      order_index: lecture.order_index?.toString() || "1"
    });
    setIsModalOpen(true);
  };

  // Handle Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalSubmitting(true);

    try {
      const token = await getJwtToken();
      if (!token) {
        throw new Error("Unable to retrieve authorization token. Please sign in again.");
      }

      if (!formData.course_id) {
        throw new Error("Please select an associated course for this lecture.");
      }

      const payload = {
        course_id: Number(formData.course_id),
        title: formData.title.trim(),
        description: formData.description.trim(),
        video_url: formData.video_url.trim(),
        order_index: parseInt(formData.order_index, 10) || 1
      };

      if (editingLecture) {
        await updateLecture(editingLecture.id, payload, token);
        toast.success(`Lecture "${payload.title}" updated successfully!`);
      } else {
        await createLecture(payload.course_id, payload, token);
        toast.success(`Lecture "${payload.title}" created and saved to database!`);
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      console.error("Lecture save failed:", err);
      toast.danger(err.message || "Failed to save lecture");
    } finally {
      setModalSubmitting(false);
    }
  };

  // Handle Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmLecture) return;
    setModalSubmitting(true);

    try {
      const token = await getJwtToken();
      if (!token) {
        throw new Error("Unable to retrieve authorization token. Please sign in again.");
      }

      await deleteLecture(deleteConfirmLecture.id, token);
      toast.success(`Lecture "${deleteConfirmLecture.title}" deleted successfully from database.`);
      setDeleteConfirmLecture(null);
      await loadData();
    } catch (err: any) {
      console.error("Failed to delete lecture:", err);
      toast.danger(err.message || "Failed to delete lecture.");
    } finally {
      setModalSubmitting(false);
    }
  };

  const modalEmbed = formData.video_url ? getEmbedVideoUrl(formData.video_url) : null;

  return (
    <div className="space-y-6">
      {/* Top Header & Add Lecture Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#A8DF8E]/40">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2.5">
            <HiVideoCamera className="w-7 h-7 text-emerald-700" />
            <span>Lecture Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Create, sequence, edit, and delete video lectures associated with their respective courses.
          </p>
        </div>

        <button
          onClick={() => openCreateModal()}
          disabled={loading || loadError || courses.length === 0}
          className="btn-primary !py-2.5 !px-5 text-xs font-bold shadow-sm flex items-center gap-2 self-start sm:self-auto cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          <HiPlus className="w-4 h-4" />
          <span>Add New Lecture</span>
        </button>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0FFDF] text-emerald-800"><HiFunnel className="h-5 w-5" /></span>
            <div><h2 className="text-sm font-extrabold text-slate-900">Find lessons</h2><p className="mt-1 text-xs text-slate-500">Filter by course or search the lesson library</p></div>
          </div>
          <span className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600">{loading ? "Loading..." : loadError ? "Unavailable" : `${filteredLectures.length} ${filteredLectures.length === 1 ? "lesson" : "lessons"} found`}</span>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <div>
            <label htmlFor="lecture-course-filter" className="mb-2 block text-xs font-bold text-slate-700">Course</label>
            <select id="lecture-course-filter" value={selectedCourseFilter} onChange={(event) => setSelectedCourseFilter(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#A8DF8E] focus:ring-4 focus:ring-[#A8DF8E]/20">
              <option value="all">All courses</option>
              {courses.map((course) => <option key={course.id} value={course.id.toString()}>{course.title}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="lecture-search" className="mb-2 block text-xs font-bold text-slate-700">Search lessons</label>
            <div className="relative"><HiMagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input id="lecture-search" type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search by title or topic..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none focus:border-[#A8DF8E] focus:ring-4 focus:ring-[#A8DF8E]/20" />
            </div>
          </div>
        </div>
        {(searchQuery || selectedCourseFilter !== "all") && (
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-5 py-3">
            <span className="text-xs font-semibold text-slate-500">Active filters:</span>
            {selectedCourseFilter !== "all" && <span className="rounded-full bg-[#F0FFDF] px-3 py-1 text-xs font-semibold text-emerald-900">{courses.find((course) => course.id.toString() === selectedCourseFilter)?.title || `Course #${selectedCourseFilter}`}</span>}
            {searchQuery && <span className="rounded-full bg-[#FFD8DF]/60 px-3 py-1 text-xs font-semibold text-rose-900">{searchQuery}</span>}
            <button type="button" onClick={() => { setSelectedCourseFilter("all"); setSearchQuery(""); router.replace("/admin/lectures"); }} className="ml-auto text-xs font-bold text-emerald-900 hover:underline">Clear filters</button>
          </div>
        )}
      </section>

      {/* Loading State */}
      {loading && (
        <AdminListSkeleton label="Loading lectures and courses..." />
      )}

      {/* Empty State */}
      {loadError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900">Could not load courses or lectures. Please refresh the page to try again.</p>}

      {!loading && !loadError && filteredLectures.length === 0 && (
        <div className="card-surface w-full border-dashed border-[#A8DF8E] bg-gradient-to-r from-[#F0FFDF]/60 via-white to-[#FFD8DF]/30 p-10 text-center sm:p-14">
          <div className="w-16 h-16 rounded-full bg-[#F0FFDF] border border-[#A8DF8E] flex items-center justify-center text-emerald-700 mx-auto mb-4">
            <HiVideoCamera className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">No Lectures Found</h2>
          <p className="text-xs text-gray-600 mb-6">
            {searchQuery || selectedCourseFilter !== "all"
              ? "No lectures match your current search or course filter."
              : "Get started by adding your first lecture to an existing course."}
          </p>
          {courses.length > 0 ? (
            <button onClick={() => openCreateModal()} className="btn-primary text-xs font-bold !py-2 !px-4">
              <HiPlus className="w-4 h-4" /><span>Add Lecture</span>
            </button>
          ) : (
            <Link href="/admin/courses" className="btn-primary text-xs font-bold !py-2 !px-4"><HiPlus className="w-4 h-4" /> Create a course</Link>
          )}
        </div>
      )}

      {/* Lectures List with Associated Course Grouping */}
      {!loading && !loadError && filteredLectures.length > 0 && (
        <div className="space-y-4">
          <div className="text-xs font-semibold text-gray-500 flex items-center justify-between px-1">
            <span>
              Showing <strong className="text-gray-900">{filteredLectures.length}</strong> lectures
            </span>
            {selectedCourseFilter !== "all" && (
              <button
                onClick={() => { setSelectedCourseFilter("all"); router.replace("/admin/lectures"); }}
                className="text-xs text-emerald-700 font-bold hover:underline"
              >
                Clear Course Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredLectures.map((lecture) => {
              const isPreviewing = previewLectureId === lecture.id;
              const embed = getEmbedVideoUrl(lecture.video_url);

              return (
                <div
                  key={lecture.id}
                  className="card-surface p-5 hover:border-[#A8DF8E] transition-all space-y-4 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Lecture Meta & Title */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Associated Course Badge */}
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-[#F0FFDF] text-emerald-900 border border-[#A8DF8E]/60">
                          <HiBookOpen className="w-3 h-3 text-emerald-700" />
                          <span>{lecture.course_title || `Course #${lecture.course_id}`}</span>
                        </span>

                        {/* Order Index Badge */}
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-700">
                          Order #{lecture.order_index}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm sm:text-base text-gray-900 truncate">
                        {lecture.title}
                      </h3>

                      <p className="text-xs text-gray-600 line-clamp-2">
                        {lecture.description || "No description provided."}
                      </p>

                      <div className="text-[11px] text-gray-400 font-mono truncate pt-1">
                        URL: {lecture.video_url}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                      {/* Live Video Preview Toggle */}
                      <button
                        onClick={() =>
                          setPreviewLectureId(isPreviewing ? null : lecture.id)
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                          isPreviewing
                            ? "bg-[#FFAAB8] text-rose-950 border-[#FFAAB8]"
                            : "bg-[#F0FFDF] hover:bg-[#A8DF8E]/30 text-emerald-900 border-[#A8DF8E]"
                        }`}
                        title="Preview video playback"
                      >
                        <HiPlay className="w-3.5 h-3.5" />
                        <span>{isPreviewing ? "Close Player" : "Preview"}</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => openEditModal(lecture)}
                        className="btn-secondary !py-1.5 !px-3 text-xs flex items-center gap-1 text-gray-700 hover:text-gray-900 cursor-pointer"
                        title="Edit Lecture"
                      >
                        <HiPencilSquare className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => setDeleteConfirmLecture(lecture)}
                        className="btn-danger !py-1.5 !px-3 text-xs flex items-center gap-1 cursor-pointer"
                        title="Delete Lecture"
                      >
                        <HiTrash className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Expandable Embedded Video Player Preview */}
                  {isPreviewing && (
                    <div className="pt-3 border-t border-gray-100 animate-in fade-in duration-200">
                      <div className="aspect-video max-w-2xl bg-black rounded-xl overflow-hidden shadow-md">
                        {embed.type === "direct" ? (
                          <video
                            src={embed.embedUrl}
                            controls
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <iframe
                            src={embed.embedUrl}
                            title={lecture.title}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CREATE / EDIT LECTURE MODAL (Matching Image 2 Style) */}
      {isModalOpen && (
        <div onMouseDown={(event) => { if (event.target === event.currentTarget && !modalSubmitting) setIsModalOpen(false); }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="lecture-dialog-title" className="card-surface max-h-[90vh] w-full max-w-xl space-y-6 overflow-y-auto rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl sm:p-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 id="lecture-dialog-title" className="text-xl font-extrabold text-gray-900">
                {editingLecture ? "Edit Lecture" : "Add New Lecture"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={modalSubmitting}
                aria-label="Close dialog"
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <HiXMark className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Associated Course Selector */}
              <div>
                <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                  ASSOCIATED COURSE <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.course_id}
                  onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#A8DF8E] focus:bg-white"
                >
                  <option value="" disabled>-- Select Course --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id.toString()}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lecture Title */}
              <div>
                <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                  LECTURE TITLE <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. 1. Introduction to App Router & Architecture"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#A8DF8E] focus:bg-white"
                />
              </div>

              {/* Lecture Description */}
              <div>
                <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                  LECTURE DESCRIPTION
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summary of topics covered, references, or instructions for this lecture..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#A8DF8E] focus:bg-white resize-none"
                />
              </div>

              {/* Video URL & Order Index Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                    VIDEO URL <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <HiVideoCamera className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      required
                      value={formData.video_url}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#A8DF8E] focus:bg-white"
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    Supports YouTube, Vimeo, or direct video URLs.
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                    ORDER INDEX
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <HiBarsArrowUp className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.order_index}
                      onChange={(e) => setFormData({ ...formData, order_index: e.target.value })}
                      placeholder="1"
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#A8DF8E] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Real-time Video Player Preview inside Modal */}
              {formData.video_url && modalEmbed && (
                <details className="p-3 bg-[#F0FFDF]/60 border border-[#A8DF8E]/60 rounded-2xl space-y-2">
                  <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-wider text-emerald-900">
                    <HiPlay className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Live Video Player Preview</span>
                  </summary>
                  <div className="mt-3 aspect-video w-full rounded-xl overflow-hidden bg-black shadow-inner">
                    {modalEmbed.type === "direct" ? (
                      <video
                        src={modalEmbed.embedUrl}
                        controls
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <iframe
                        src={modalEmbed.embedUrl}
                        title="Live Video Preview"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={modalSubmitting}
                  className="px-5 py-2.5 rounded-xl border border-pink-200 hover:border-[#FFAAB8] text-xs font-bold text-gray-700 hover:bg-[#FFD8DF]/30 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#A8DF8E] hover:bg-emerald-400 text-gray-900 text-xs font-extrabold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {modalSubmitting ? (
                    <span>Saving...</span>
                  ) : editingLecture ? (
                    <span>Save Changes</span>
                  ) : (
                    <span>Add Lecture</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmLecture && (
        <div onMouseDown={(event) => { if (event.target === event.currentTarget && !modalSubmitting) setDeleteConfirmLecture(null); }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="delete-lecture-title" className="card-surface w-full max-w-md rounded-3xl border border-red-200 bg-white p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-[#FFD8DF] flex items-center justify-center text-rose-700 mx-auto mb-4">
              <HiTrash className="w-6 h-6" />
            </div>

            <h3 id="delete-lecture-title" className="text-lg font-bold text-gray-900 text-center mb-2">
              Delete Lecture?
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 text-center mb-6 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <span className="font-bold text-gray-900">"{deleteConfirmLecture.title}"</span>?
              This lecture will be removed from its course and database permanently.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmLecture(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all flex-1 cursor-pointer"
                disabled={modalSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm flex-1 cursor-pointer disabled:opacity-50"
                disabled={modalSubmitting}
              >
                {modalSubmitting ? "Deleting..." : "Yes, Delete Lecture"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminLecturesPage() {
  return (
    <Suspense
      fallback={<AdminListSkeleton label="Loading lecture workspace..." />}
    >
      <LecturesManager />
    </Suspense>
  );
}
