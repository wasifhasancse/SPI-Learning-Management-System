"use client";

import { useEffect, useState, use } from "react";
import { useToast } from "@/components/ToastNotifications";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  Course,
  Lecture,
  fetchCourseById,
  fetchLecturesByCourse,
  createLecture,
  updateLecture,
  deleteLecture,
  getJwtToken
} from "@/lib/api";
import { getEmbedVideoUrl } from "@/lib/videoHelper";
import AdminListSkeleton from "@/components/AdminListSkeleton";
import {
  HiArrowLeft,
  HiPlus,
  HiPencilSquare,
  HiTrash,
  HiPlay,
  HiVideoCamera,
  HiLockClosed,
  HiEye,
  HiXMark,
  HiAcademicCap,
  HiLink
} from "react-icons/hi2";

export default function AdminLecturesPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const toast = useToast();
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;

  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  const [course, setCourse] = useState<Course | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);
  const [deleteConfirmLecture, setDeleteConfirmLecture] = useState<Lecture | null>(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [modalSubmitting, setModalSubmitting] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    video_url: "",
    order_index: "1"
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [courseData, lecturesData] = await Promise.all([
        fetchCourseById(courseId),
        fetchLecturesByCourse(courseId)
      ]);
      if (!courseData) throw new Error("Course not found.");
      setCourse(courseData);
      setLectures(lecturesData);
    } catch (err: unknown) {
      console.error("Failed to load lecture data:", err);
      const message = err instanceof Error ? err.message : "Failed to load course or lectures";
      setError(message);
      toast.danger(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [courseId]);

  const openCreateModal = () => {
    setEditingLecture(null);
    setFormData({
      title: "",
      description: "",
      video_url: "",
      order_index: (lectures.length + 1).toString()
    });
    setIsModalOpen(true);
  };

  const openEditModal = (lecture: Lecture) => {
    setEditingLecture(lecture);
    setFormData({
      title: lecture.title,
      description: lecture.description || "",
      video_url: lecture.video_url,
      order_index: lecture.order_index.toString()
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalSubmitting(true);

    try {
      const token = await getJwtToken();
      if (!token) {
        throw new Error("Unable to retrieve authorization token. Please sign in again.");
      }

      if (editingLecture) {
        // Update lecture
        const updated = await updateLecture(
          editingLecture.id,
          {
            title: formData.title,
            description: formData.description,
            video_url: formData.video_url,
            order_index: parseInt(formData.order_index, 10) || 1
          },
          token
        );
        toast.success(`Lecture "${updated.title}" updated successfully!`);
      } else {
        // Create lecture
        const created = await createLecture(
          courseId,
          {
            title: formData.title,
            description: formData.description,
            video_url: formData.video_url,
            order_index: parseInt(formData.order_index, 10) || (lectures.length + 1)
          },
          token
        );
        toast.success(`Lecture "${created.title}" added to curriculum!`);
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      console.error("Failed to save lecture:", err);
      toast.danger(err.message || "Failed to save lecture");
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmLecture) return;
    setModalSubmitting(true);
    try {
      const token = await getJwtToken();
      if (!token) {
        throw new Error("Unable to retrieve authorization token. Please sign in again.");
      }

      await deleteLecture(deleteConfirmLecture.id, token);
      toast.success(`Lecture "${deleteConfirmLecture.title}" deleted!`);
      setDeleteConfirmLecture(null);
      await loadData();
    } catch (err: any) {
      console.error("Failed to delete lecture:", err);
      toast.danger(err.message || "Failed to delete lecture");
    } finally {
      setModalSubmitting(false);
    }
  };

  // Auth Guard
  if (!sessionLoading && !session?.user) {
    return (
      <div className="py-12">
        <div className="card-surface max-w-md mx-auto p-8 text-center border-[#FFAAB8]">
          <div className="w-14 h-14 rounded-2xl bg-[#FFD8DF] flex items-center justify-center text-rose-700 mx-auto mb-4">
            <HiLockClosed className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Admin Authentication Required
          </h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Lecture management is restricted to authorized administrators.
          </p>
          <Link href="/login" className="btn-primary w-full text-center block">
            Sign In as Admin
          </Link>
        </div>
      </div>
    );
  }

  const embedPreview = formData.video_url ? getEmbedVideoUrl(formData.video_url) : null;
  const activeModalEmbed = previewVideoUrl ? getEmbedVideoUrl(previewVideoUrl) : null;

  return (
    <div className="space-y-6">
      {/* Back button & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#A8DF8E]/30">
        <div>
          <Link
            href="/admin/courses"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 mb-2 transition-colors"
          >
            <HiArrowLeft className="w-4 h-4 text-emerald-700" />
            <span>Back to All Courses</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <HiAcademicCap className="w-8 h-8 text-emerald-700 shrink-0" />
            {loading ? <span role="status" aria-label="Loading course" className="h-7 w-48 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" /> : <span>{course?.title || "Course Lectures"}</span>}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Manage the curriculum, video links, and lecture sequencing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {course && (
            <Link
              href={`/courses/${course.id}`}
              target="_blank"
              className="btn-secondary text-xs"
            >
              <HiEye className="w-4 h-4 text-blue-600" />
              <span>Student View</span>
            </Link>
          )}

          <button
            onClick={openCreateModal}
            disabled={loading || !!error || !course}
            className="btn-primary text-sm shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            <HiPlus className="w-4 h-4" />
            <span>Add Lecture</span>
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <AdminListSkeleton label="Loading lectures..." />
      )}

      {/* Empty State */}
      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900">{error}</p>}

      {!loading && !error && lectures.length === 0 && (
        <div className="card-surface w-full border-dashed border-[#A8DF8E] bg-gradient-to-r from-[#F0FFDF]/60 via-white to-[#FFD8DF]/30 p-10 text-center sm:p-14">
          <div className="w-16 h-16 rounded-full bg-[#F0FFDF] border border-[#A8DF8E] flex items-center justify-center text-emerald-700 mx-auto mb-4">
            <HiVideoCamera className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            No Lectures Added Yet
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Add videos and lessons to this course so students can watch them.
          </p>
          <button onClick={openCreateModal} className="btn-primary text-sm">
            <HiPlus className="w-4 h-4" />
            Add First Lecture
          </button>
        </div>
      )}

      {/* Lectures Table / List */}
      {!loading && !error && lectures.length > 0 && (
        <div className="card-surface overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-[#F0FFDF]/80 border-b border-[#A8DF8E]/40 text-xs uppercase font-bold text-gray-700">
                <tr>
                  <th className="py-3.5 px-4 w-16 text-center">#</th>
                  <th className="py-3.5 px-4">Lecture Title & Description</th>
                  <th className="py-3.5 px-4">Video Source</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lectures.map((lecture) => (
                  <tr key={lecture.id} className="hover:bg-[#F0FFDF]/40 transition-colors">
                    {/* Order index */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="w-7 h-7 rounded-lg bg-[#FFD8DF] text-rose-900 font-bold text-xs inline-flex items-center justify-center">
                        {lecture.order_index}
                      </span>
                    </td>

                    {/* Title & Description */}
                    <td className="py-3.5 px-4">
                      <div className="min-w-0">
                        <span className="font-bold text-gray-900 block">
                          {lecture.title}
                        </span>
                        <span className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                          {lecture.description || "No notes"}
                        </span>
                      </div>
                    </td>

                    {/* Video URL */}
                    <td className="py-3.5 px-4 text-xs font-mono text-gray-600 max-w-xs truncate">
                      <div className="flex items-center gap-1.5">
                        <HiLink className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="truncate" title={lecture.video_url}>
                          {lecture.video_url}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setPreviewVideoUrl(lecture.video_url)}
                        className="btn-secondary !py-1 !px-2.5 text-xs text-emerald-800"
                        title="Watch Video Preview"
                      >
                        <HiPlay className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Play</span>
                      </button>

                      <button
                        onClick={() => openEditModal(lecture)}
                        className="btn-secondary !py-1 !px-2.5 text-xs text-amber-800 hover:bg-amber-100"
                        title="Edit Lecture"
                      >
                        <HiPencilSquare className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => setDeleteConfirmLecture(lecture)}
                        className="btn-danger !py-1 !px-2.5 text-xs"
                        title="Delete Lecture"
                      >
                        <HiTrash className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT LECTURE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-surface w-full max-w-lg p-6 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-5">
              <h3 className="text-lg font-bold text-gray-900">
                {editingLecture ? "Edit Lecture" : "Add New Lecture"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg"
              >
                <HiXMark className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Lecture Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. 1. Introduction to PostgreSQL Queries"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A8DF8E] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Lecture Description / Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Key takeaways, references, or instructions covered in this video..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A8DF8E] focus:bg-white resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Embedded Video URL <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=... or direct MP4 link"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A8DF8E] focus:bg-white"
                  />
                  <span className="text-[10px] text-gray-500 block mt-1">
                    Accepts YouTube watch/embed URLs, Vimeo, or direct MP4 links.
                  </span>
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Order #
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A8DF8E] focus:bg-white text-center"
                  />
                </div>
              </div>

              {/* Real-time Video Embed Preview in Form */}
              {embedPreview && embedPreview.embedUrl && (
                <div className="mt-3">
                  <span className="text-xs font-semibold text-gray-700 block mb-1">
                    Live Video Preview:
                  </span>
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-gray-200">
                    {embedPreview.type === "direct" ? (
                      <video
                        src={embedPreview.embedUrl}
                        controls
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <iframe
                        src={embedPreview.embedUrl}
                        title="Form Preview"
                        className="w-full h-full border-0"
                        allowFullScreen
                      />
                    )}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="btn-primary text-sm font-bold"
                >
                  {modalSubmitting ? "Saving..." : editingLecture ? "Save Changes" : "Add Lecture"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK VIDEO PREVIEW MODAL */}
      {previewVideoUrl && activeModalEmbed && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-black rounded-2xl overflow-hidden shadow-2xl relative border border-gray-800">
            <button
              onClick={() => setPreviewVideoUrl(null)}
              className="absolute top-3 right-3 z-10 bg-black/60 hover:bg-black text-white p-2 rounded-full cursor-pointer"
              title="Close Preview"
            >
              <HiXMark className="w-5 h-5" />
            </button>
            <div className="aspect-video w-full">
              {activeModalEmbed.type === "direct" ? (
                <video
                  src={activeModalEmbed.embedUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <iframe
                  src={activeModalEmbed.embedUrl}
                  title="Lecture Preview"
                  className="w-full h-full border-0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmLecture && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card-surface w-full max-w-md p-6 bg-white shadow-2xl border-red-200">
            <div className="w-12 h-12 rounded-full bg-[#FFD8DF] flex items-center justify-center text-rose-700 mx-auto mb-4">
              <HiTrash className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
              Delete Lecture?
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <span className="font-bold text-gray-900">"{deleteConfirmLecture.title}"</span>?
              Students will no longer be able to watch this video.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmLecture(null)}
                className="btn-secondary text-sm flex-1"
                disabled={modalSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="btn-danger text-sm flex-1 font-bold"
                disabled={modalSubmitting}
              >
                {modalSubmitting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

