"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ToastNotifications";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  Course,
  fetchCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  createLecture,
  getJwtToken
} from "@/lib/api";
import { getEmbedVideoUrl } from "@/lib/videoHelper";
import AdminListSkeleton from "@/components/AdminListSkeleton";
import {
  HiPlus,
  HiPencilSquare,
  HiTrash,
  HiVideoCamera,
  HiEye,
  HiTableCells,
  HiSquares2X2,
  HiXMark,
  HiCurrencyDollar,
  HiPhoto,
  HiPlay,
  HiBookOpen,
  HiBarsArrowUp
} from "react-icons/hi2";

export default function AdminCoursesPage() {
  const toast = useToast();
  const router = useRouter();
  const { data: session } = useSession();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // View mode: 'table' | 'grid'
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Course Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deleteConfirmCourse, setDeleteConfirmCourse] = useState<Course | null>(null);
  const [modalSubmitting, setModalSubmitting] = useState(false);

  // Quick Add Lecture Modal states
  const [quickLectureCourse, setQuickLectureCourse] = useState<Course | null>(null);
  const [quickLectureData, setQuickLectureData] = useState({
    title: "",
    description: "",
    video_url: "",
    order_index: "1"
  });

  // Course Form fields
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "29.99",
    thumbnail_url: ""
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const data = await fetchCourses();
      setCourses(data);
    } catch (err: any) {
      console.error("Failed to load courses:", err);
      setLoadError(true);
      toast.danger(err.message || "Failed to load courses from database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!isModalOpen && !quickLectureCourse && !deleteConfirmCourse) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !modalSubmitting) {
        setIsModalOpen(false);
        setQuickLectureCourse(null);
        setDeleteConfirmCourse(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, quickLectureCourse, deleteConfirmCourse, modalSubmitting]);

  const openCreateModal = () => {
    setEditingCourse(null);
    setFormData({
      title: "",
      description: "",
      price: "29.99",
      thumbnail_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80"
    });
    setIsModalOpen(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description || "",
      price: course.price.toString(),
      thumbnail_url: course.thumbnail_url || ""
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

      if (editingCourse) {
        const updated = await updateCourse(
          editingCourse.id,
          {
            title: formData.title.trim(),
            description: formData.description.trim(),
            price: parseFloat(formData.price) || 0,
            thumbnail_url: formData.thumbnail_url.trim()
          },
          token
        );
        toast.success(`Course "${updated.title}" updated successfully!`);
      } else {
        const created = await createCourse(
          {
            title: formData.title.trim(),
            description: formData.description.trim(),
            price: parseFloat(formData.price) || 0,
            thumbnail_url: formData.thumbnail_url.trim()
          },
          token
        );
        toast.success(`Course "${created.title}" created successfully!`);
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      console.error("Failed to save course:", err);
      toast.danger(err.message || "Failed to save course");
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmCourse) return;
    setModalSubmitting(true);

    try {
      const token = await getJwtToken();
      if (!token) {
        throw new Error("Unable to retrieve authorization token. Please sign in again.");
      }

      await deleteCourse(deleteConfirmCourse.id, token);
      toast.success(`Course "${deleteConfirmCourse.title}" deleted successfully!`);
      setDeleteConfirmCourse(null);
      await loadData();
    } catch (err: any) {
      console.error("Failed to delete course:", err);
      toast.danger(err.message || "Failed to delete course");
    } finally {
      setModalSubmitting(false);
    }
  };

  // Quick Add Lecture
  const openQuickAddLecture = (course: Course) => {
    setQuickLectureCourse(course);
    const nextOrder = (course.lecture_count || 0) + 1;
    setQuickLectureData({
      title: "",
      description: "",
      video_url: "",
      order_index: nextOrder.toString()
    });
  };

  const handleQuickLectureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickLectureCourse) return;
    setModalSubmitting(true);

    try {
      const token = await getJwtToken();
      if (!token) {
        throw new Error("Unable to retrieve authorization token. Please sign in again.");
      }

      await createLecture(
        quickLectureCourse.id,
        {
          course_id: quickLectureCourse.id,
          title: quickLectureData.title.trim(),
          description: quickLectureData.description.trim(),
          video_url: quickLectureData.video_url.trim(),
          order_index: parseInt(quickLectureData.order_index, 10) || 1
        },
        token
      );

      toast.success(`Lecture added to "${quickLectureCourse.title}" successfully!`);
      setQuickLectureCourse(null);
      await loadData();
    } catch (err: any) {
      console.error("Failed to add lecture:", err);
      toast.danger(err.message || "Failed to add lecture");
    } finally {
      setModalSubmitting(false);
    }
  };

  const quickEmbed = quickLectureData.video_url ? getEmbedVideoUrl(quickLectureData.video_url) : null;

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#A8DF8E]/40">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2.5">
            <HiBookOpen className="w-7 h-7 text-emerald-700" />
            <span>Course Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Create, edit, organize courses, and manage linked video lectures.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Table / Grid view toggle */}
          <div className="bg-white border border-gray-200 rounded-xl p-1 flex items-center shadow-2xs">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-[#A8DF8E] text-gray-900 shadow-2xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              title="Table view"
            >
              <HiTableCells className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[#A8DF8E] text-gray-900 shadow-2xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              title="Grid view"
            >
              <HiSquares2X2 className="w-4 h-4" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>

          {/* Create Course Button */}
          <button
            onClick={openCreateModal}
            className="btn-primary !py-2.5 !px-4 text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <HiPlus className="w-4 h-4" />
            <span>Create New Course</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <AdminListSkeleton label="Loading courses..." cards={viewMode === "grid"} />
      )}

      {loadError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900">Could not load courses. Please refresh the page to try again.</p>}

      {/* Empty State */}
      {!loading && !loadError && courses.length === 0 && (
        <div className="card-surface w-full border-dashed border-[#A8DF8E] bg-gradient-to-r from-[#F0FFDF]/60 via-white to-[#FFD8DF]/30 p-10 text-center sm:p-14">
          <div className="w-16 h-16 rounded-full bg-[#F0FFDF] border border-[#A8DF8E] flex items-center justify-center text-emerald-700 mx-auto mb-4 shadow-2xs">
            <HiPlus className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">No Courses Created Yet</h2>
          <p className="text-xs text-gray-600 mb-6">
            Get started by creating your first course and associating structured video lectures.
          </p>
          <button onClick={openCreateModal} className="btn-primary text-xs font-bold !py-2.5 !px-5 cursor-pointer">
            <HiPlus className="w-4 h-4" />
            <span>Create Your First Course</span>
          </button>
        </div>
      )}

      {/* TABLE VIEW */}
      {!loading && !loadError && courses.length > 0 && viewMode === "table" && (
        <div className="card-surface overflow-hidden p-0 shadow-sm border-[#A8DF8E]/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead className="bg-[#F0FFDF]/90 border-b border-[#A8DF8E]/40 text-xs uppercase font-extrabold text-gray-700">
                <tr>
                  <th className="py-3.5 px-4">Course Info</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Lecture Management</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-[#F0FFDF]/40 transition-colors">
                    {/* Course info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={course.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=120&q=80"}
                          alt={course.title}
                          className="w-14 h-9 rounded-lg object-cover bg-gray-100 shrink-0 border border-gray-200"
                        />
                        <div className="min-w-0">
                          <span className="font-bold text-gray-900 block truncate max-w-xs md:max-w-md">
                            {course.title}
                          </span>
                          <span className="text-[11px] text-gray-500 line-clamp-1">
                            {course.description || "No description provided."}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-bold text-gray-900 whitespace-nowrap">
                      {Number(course.price) === 0 ? (
                        <span className="text-emerald-700">Free Access</span>
                      ) : (
                        `$${Number(course.price).toFixed(2)}`
                      )}
                    </td>

                    {/* Decorated Lecture Management Button & Counter */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {/* Decorated Button for Lecture Management */}
                        <Link
                          href={`/admin/lectures?courseId=${course.id}`}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F0FFDF] hover:bg-[#A8DF8E]/50 border border-[#A8DF8E] text-xs font-bold text-gray-900 transition-all shadow-2xs group cursor-pointer"
                          title="Manage lectures for this course"
                        >
                          <HiVideoCamera className="w-4 h-4 text-emerald-800 group-hover:scale-110 transition-transform" />
                          <span>Manage Lectures</span>
                          <span className="px-1.5 py-0.5 rounded-md bg-white text-[10px] font-extrabold text-emerald-900 border border-[#A8DF8E]/80 shadow-2xs">
                            {course.lecture_count ?? 0}
                          </span>
                        </Link>

                        {/* Quick Add Lecture Button */}
                        <button
                          onClick={() => openQuickAddLecture(course)}
                          className="p-1.5 rounded-xl bg-white hover:bg-[#F0FFDF] border border-gray-200 hover:border-[#A8DF8E] text-emerald-800 text-xs font-bold transition-colors cursor-pointer"
                          title="Quick add lecture"
                        >
                          <HiPlus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                    {/* Edit and Delete Actions */}
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <Link
                        href={`/courses/${course.id}`}
                        target="_blank"
                        className="btn-secondary !py-1.5 !px-2.5 text-xs inline-flex items-center gap-1"
                        title="Preview Public Student View"
                      >
                        <HiEye className="w-3.5 h-3.5 text-gray-600" />
                        <span className="hidden sm:inline">Preview</span>
                      </Link>

                      <button
                        onClick={() => openEditModal(course)}
                        className="btn-secondary !py-1.5 !px-2.5 text-xs text-gray-700 hover:text-gray-900 inline-flex items-center gap-1 cursor-pointer"
                        title="Edit Course"
                      >
                        <HiPencilSquare className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>

                      <button
                        onClick={() => setDeleteConfirmCourse(course)}
                        className="btn-danger !py-1.5 !px-2.5 text-xs inline-flex items-center gap-1 cursor-pointer"
                        title="Delete Course"
                      >
                        <HiTrash className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GRID / CARD VIEW */}
      {!loading && !loadError && courses.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="card-surface p-5 flex flex-col justify-between space-y-4 shadow-sm border-[#A8DF8E]/40 hover:border-[#A8DF8E] transition-all">
              <div>
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-gray-100 mb-3 relative border border-gray-200">
                  <img
                    src={course.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80"}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2.5 right-2.5 badge-pink font-extrabold shadow-xs">
                    {Number(course.price) === 0 ? "Free" : `$${Number(course.price).toFixed(2)}`}
                  </span>
                </div>

                <h3 className="font-bold text-base text-gray-900 line-clamp-1 mb-1">
                  {course.title}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                  {course.description || "No description provided."}
                </p>

                {/* Decorated Button for Lecture Management */}
                <div className="pt-2">
                  <Link
                    href={`/admin/lectures?courseId=${course.id}`}
                    className="w-full inline-flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#F0FFDF] hover:bg-[#A8DF8E]/50 border border-[#A8DF8E] text-xs font-bold text-gray-900 transition-all shadow-2xs group"
                  >
                    <div className="flex items-center gap-2">
                      <HiVideoCamera className="w-4 h-4 text-emerald-800 group-hover:scale-110 transition-transform" />
                      <span>Lecture Management</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-white text-[10px] font-extrabold text-emerald-900 border border-[#A8DF8E]/80 shadow-2xs">
                      {course.lecture_count ?? 0} Lectures
                    </span>
                  </Link>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-gray-100 grid grid-cols-3 gap-2">
                <button
                  onClick={() => openQuickAddLecture(course)}
                  className="btn-secondary !py-1.5 text-xs flex items-center justify-center gap-1 cursor-pointer"
                  title="Add Lecture"
                >
                  <HiPlus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>

                <button
                  onClick={() => openEditModal(course)}
                  className="btn-secondary !py-1.5 text-xs flex items-center justify-center gap-1 cursor-pointer"
                  title="Edit Course"
                >
                  <HiPencilSquare className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => setDeleteConfirmCourse(course)}
                  className="btn-danger !py-1.5 text-xs flex items-center justify-center gap-1 cursor-pointer"
                  title="Delete Course"
                >
                  <HiTrash className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* IMPROVED CREATE / EDIT COURSE MODAL (Matching User Reference Image 2) */}
      {isModalOpen && (
        <div onMouseDown={(event) => { if (event.target === event.currentTarget && !modalSubmitting) setIsModalOpen(false); }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="course-dialog-title" className="card-surface max-h-[90vh] w-full max-w-xl space-y-6 overflow-y-auto rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl sm:p-8">
            {/* Modal Header with Close Button */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 id="course-dialog-title" className="text-xl font-extrabold text-gray-900 tracking-tight">
                {editingCourse ? "Edit Course" : "Create New Course"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={modalSubmitting}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <HiXMark className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              {/* COURSE TITLE * */}
              <div>
                <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                  COURSE TITLE <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Modern Web Development with Next.js & Express"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#A8DF8E] focus:border-transparent transition-all shadow-xs"
                />
              </div>

              {/* COURSE DESCRIPTION */}
              <div>
                <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                  COURSE DESCRIPTION
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed summary of what students will learn in this course..."
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#A8DF8E] focus:border-transparent transition-all shadow-xs resize-none"
                />
              </div>

              {/* 2-COLUMN GRID: PRICE and THUMBNAIL URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* PRICE ($ USD) * */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                    PRICE ($ USD) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                      <HiCurrencyDollar className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="29.99"
                      className="w-full pl-10 pr-3.5 py-3 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#A8DF8E] focus:border-transparent transition-all shadow-xs"
                    />
                  </div>
                </div>

                {/* THUMBNAIL IMAGE URL */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                    THUMBNAIL IMAGE URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                      <HiPhoto className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      value={formData.thumbnail_url}
                      onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full pl-10 pr-3.5 py-3 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#A8DF8E] focus:border-transparent transition-all shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* LIVE THUMBNAIL PREVIEW BOX */}
              {formData.thumbnail_url && (
                <div className="p-3 bg-[#F0FFDF]/60 border border-[#A8DF8E]/60 rounded-2xl flex items-center gap-4">
                  <div className="aspect-video w-24 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                    <img
                      src={formData.thumbnail_url}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-emerald-950 block">Thumbnail Preview</span>
                    <span className="text-[11px] text-gray-500 line-clamp-1">
                      This banner will be displayed to students on catalog cards.
                    </span>
                  </div>
                </div>
              )}

              {/* FOOTER ACTIONS (Cancel and Create Course - Matching Image 2) */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={modalSubmitting}
                  className="px-6 py-2.5 rounded-2xl border border-pink-200 hover:border-[#FFAAB8] text-xs font-bold text-gray-700 hover:bg-[#FFD8DF]/30 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-6 py-2.5 rounded-2xl bg-[#A8DF8E] hover:bg-emerald-400 text-gray-900 text-xs font-extrabold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {modalSubmitting ? (
                    <span>Saving...</span>
                  ) : editingCourse ? (
                    <span>Save Changes</span>
                  ) : (
                    <span>Create Course</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK ADD LECTURE MODAL */}
      {quickLectureCourse && (
        <div onMouseDown={(event) => { if (event.target === event.currentTarget && !modalSubmitting) setQuickLectureCourse(null); }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="quick-lecture-title" className="card-surface max-h-[90vh] w-full max-w-xl space-y-6 overflow-y-auto rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 id="quick-lecture-title" className="text-xl font-extrabold text-gray-900">
                  Add Lecture to Course
                </h3>
                <span className="text-xs font-bold text-emerald-800">
                  {quickLectureCourse.title}
                </span>
              </div>
              <button
                onClick={() => setQuickLectureCourse(null)}
                disabled={modalSubmitting}
                aria-label="Close dialog"
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <HiXMark className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickLectureSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                  LECTURE TITLE <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={quickLectureData.title}
                  onChange={(e) => setQuickLectureData({ ...quickLectureData, title: e.target.value })}
                  placeholder="e.g. 1. Introduction & Overview"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#A8DF8E] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                  LECTURE DESCRIPTION
                </label>
                <textarea
                  rows={3}
                  value={quickLectureData.description}
                  onChange={(e) => setQuickLectureData({ ...quickLectureData, description: e.target.value })}
                  placeholder="Summary of topics covered..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#A8DF8E] focus:bg-white resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                    VIDEO URL <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={quickLectureData.video_url}
                    onChange={(e) => setQuickLectureData({ ...quickLectureData, video_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#A8DF8E] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-1.5">
                    ORDER INDEX
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quickLectureData.order_index}
                    onChange={(e) => setQuickLectureData({ ...quickLectureData, order_index: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#A8DF8E] focus:bg-white"
                  />
                </div>
              </div>

              {/* Video Preview */}
              {quickLectureData.video_url && quickEmbed && (
                <details className="p-3 bg-[#F0FFDF]/60 border border-[#A8DF8E]/60 rounded-2xl space-y-2">
                  <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-wider text-emerald-900">
                    Live Video Preview
                  </summary>
                  <div className="mt-3 aspect-video w-full rounded-xl overflow-hidden bg-black shadow-inner">
                    {quickEmbed.type === "direct" ? (
                      <video src={quickEmbed.embedUrl} controls className="w-full h-full object-contain" />
                    ) : (
                      <iframe
                        src={quickEmbed.embedUrl}
                        title="Video Preview"
                        className="w-full h-full border-0"
                        allowFullScreen
                      />
                    )}
                  </div>
                </details>
              )}

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setQuickLectureCourse(null)}
                  disabled={modalSubmitting}
                  className="px-5 py-2.5 rounded-xl border border-pink-200 text-xs font-bold text-gray-700 hover:bg-[#FFD8DF]/30 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#A8DF8E] hover:bg-emerald-400 text-gray-900 text-xs font-extrabold cursor-pointer disabled:opacity-50"
                >
                  {modalSubmitting ? "Saving..." : "Add Lecture"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmCourse && (
        <div onMouseDown={(event) => { if (event.target === event.currentTarget && !modalSubmitting) setDeleteConfirmCourse(null); }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="delete-course-title" className="card-surface w-full max-w-md rounded-3xl border border-red-200 bg-white p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-[#FFD8DF] flex items-center justify-center text-rose-700 mx-auto mb-4">
              <HiTrash className="w-6 h-6" />
            </div>

            <h3 id="delete-course-title" className="text-lg font-bold text-gray-900 text-center mb-2">
              Delete Course?
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 text-center mb-6 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <span className="font-bold text-gray-900">"{deleteConfirmCourse.title}"</span>?
              All associated lectures will also be deleted from the database. This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmCourse(null)}
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
                {modalSubmitting ? "Deleting..." : "Yes, Delete Course"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
