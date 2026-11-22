
"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Loader2,
  FolderKanban,
  Star,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

import { api } from "@/lib/api";
import ProjectImageUpload from "@/components/admin/ProjectImageUpload";

type ProjectStatus = "draft" | "published";

interface Project {
  id: number;
  title: string;
  slug: string;
  category: string;
  description: string;
  content: string | null;
  technologies: string[] | null;
  cover_image: string | null;
  project_url: string | null;
  github_url: string | null;
  status: ProjectStatus;
  featured: boolean;
  sort_order: number;
}

interface PaginatedProjects {
  data: Project[];
  current_page: number;
  last_page: number;
  total: number;
}

interface ProjectForm {
  title: string;
  slug: string;
  category: string;
  description: string;
  content: string;
  technologies: string;
  cover_image: string;
  project_url: string;
  github_url: string;
  status: ProjectStatus;
  featured: boolean;
  sort_order: number;
}

const emptyForm: ProjectForm = {
  title: "",
  slug: "",
  category: "",
  description: "",
  content: "",
  technologies: "",
  cover_image: "",
  project_url: "",
  github_url: "",
  status: "draft",
  featured: false,
  sort_order: 0,
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#0B0B12] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#00C8C8]";

const categories = [
  "Web Development",
  "Mobile Development",
  "UI/UX Design",
  "Graphic Design",
  "Motion Design",
  "Full-Stack Application",
  "Other",
];

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      return "Session expirée. Reconnectez-vous.";
    }

    if (error.response?.status === 403) {
      return "Accès administrateur refusé.";
    }

    if (error.response?.status === 422) {
      const errors = error.response.data?.errors as
        | Record<string, string[]>
        | undefined;

      const firstError = errors
        ? Object.values(errors).flat()[0]
        : undefined;

      return firstError ?? "Vérifiez les champs du formulaire.";
    }

    return (
      error.response?.data?.message ??
      "Erreur de communication avec le serveur."
    );
  }

  return "Une erreur inattendue est survenue.";
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(
    null
  );

  const [form, setForm] = useState<ProjectForm>({ ...emptyForm });
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProjects = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get<PaginatedProjects>(
        "/api/admin/projects",
        {
          params: {
            page,
            search: search.trim() || undefined,
            status:
              statusFilter === "all" ? undefined : statusFilter,
          },
          signal,
        }
      );

      if (signal?.aborted) return;

      setProjects(response.data.data);
      setTotal(response.data.total);
      setLastPage(response.data.last_page);
    } catch (err) {
      if (signal?.aborted || axios.isCancel(err)) return;

      setError(getErrorMessage(err));
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      void loadProjects(controller.signal);
    }, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [loadProjects]);

  function updateForm<K extends keyof ProjectForm>(
    field: K,
    value: ProjectForm[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function openCreateModal() {
    setEditingProject(null);
    setForm({ ...emptyForm });
    setFormError("");
    setModalOpen(true);
  }

  function openEditModal(project: Project) {
    setEditingProject(project);

    setForm({
      title: project.title,
      slug: project.slug,
      category: project.category,
      description: project.description,
      content: project.content ?? "",
      technologies: (project.technologies ?? []).join(", "),
      cover_image: project.cover_image ?? "",
      project_url: project.project_url ?? "",
      github_url: project.github_url ?? "",
      status: project.status,
      featured: project.featured,
      sort_order: project.sort_order,
    });

    setFormError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    setEditingProject(null);
    setFormError("");
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setFormError("");
    setSuccess("");

    const payload = {
      title: form.title.trim(),
      category: form.category,
      description: form.description.trim(),
      content: form.content.trim() || null,
      technologies: form.technologies
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      cover_image: form.cover_image.trim() || null,
      project_url: form.project_url.trim() || null,
      github_url: form.github_url.trim() || null,
      status: form.status,
      featured: form.featured,
      sort_order: Number(form.sort_order),
      ...(form.slug.trim()
        ? { slug: form.slug.trim() }
        : {}),
    };

    try {
      if (editingProject) {
        await api.put(
          `/api/admin/projects/${editingProject.id}`,
          payload
        );
        setSuccess("Projet modifié avec succès.");
      } else {
        await api.post("/api/admin/projects", payload);
        setSuccess("Projet ajouté avec succès.");
      }

      setModalOpen(false);
      setEditingProject(null);
      await loadProjects();

    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(project: Project) {
    const confirmed = window.confirm(
      `Supprimer définitivement le projet "${project.title}" ?`
    );

    if (!confirmed || deletingId !== null) return;

    setDeletingId(project.id);
    setError("");
    setSuccess("");

    try {
      await api.delete(`/api/admin/projects/${project.id}`);

      setSuccess("Projet supprimé avec succès.");

      if (projects.length === 1 && page > 1) {
        setPage((previous) => previous - 1);
      } else {
        await loadProjects();
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8 text-white">
      {/* Header */}
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-[0.25em] text-[#00C8C8]">
            PORTFOLIO MANAGEMENT
          </p>

          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            My Projects
          </h1>

          <p className="mt-3 text-sm text-gray-400">
            Gérez vos projets web, mobile et créatifs.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#00C8C8] px-5 py-3 text-sm font-semibold text-[#0B0B12] transition hover:bg-[#00E5E5]"
        >
          <Plus size={19} />
          Add Project
        </button>
      </section>

      {/* Feedback */}
      {error && (
        <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div role="status" className="rounded-xl border border-[#00C8C8]/20 bg-[#00C8C8]/10 p-4 text-sm text-[#00C8C8]">
          {success}
        </div>
      )}

      {/* Filters */}
      <section className="rounded-2xl border border-white/10 bg-[#151520] p-5">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search projects..."
              aria-label="Search projects"
              className={`${inputClass} pl-12`}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            aria-label="Filter projects by status"
            className={`${inputClass} md:w-48`}
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <button
            type="button"
            onClick={() => void loadProjects()}
            aria-label="Refresh projects"
            title="Refresh projects"
            className="rounded-xl border border-white/10 px-4 py-3 text-gray-300 transition hover:bg-white/10"
          >
            <RefreshCw size={19} />
          </button>
        </div>
      </section>

      {/* Projects table */}
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#151520]">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <FolderKanban size={21} className="text-[#00C8C8]" />
            <h2 className="font-semibold">Projects List</h2>
          </div>

          <span className="text-sm text-gray-400">
            {total} projects
          </span>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 text-gray-400">
            <Loader2 className="animate-spin text-[#00C8C8]" />
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <FolderKanban
              size={40}
              className="mb-4 text-gray-600"
            />

            <p className="font-medium">No projects found</p>

            <p className="mt-2 text-sm text-gray-500">
              Ajoutez votre premier projet ou modifiez les filtres.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-gray-400">
                <tr>
                  <th className="px-6 py-4">Project</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Featured</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {projects.map((project) => (
                  <tr
                    key={project.id}
                    className="border-t border-white/10 transition hover:bg-white/[0.03]"
                  >
                    <td className="px-6 py-5">
                      <div className="font-semibold text-white">
                        {project.title}
                      </div>

                      <div className="mt-1 text-xs text-gray-500">
                        /{project.slug}
                      </div>
                    </td>

                    <td className="px-6 py-5 text-gray-300">
                      {project.category}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          project.status === "published"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {project.status === "published"
                          ? "Published"
                          : "Draft"}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      {project.featured ? (
                        <Star
                          size={19}
                          className="fill-amber-400 text-amber-400"
                        />
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        {project.project_url && (
                          <a
                            href={project.project_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Open ${project.title}`}
                            className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white"
                          >
                            <ExternalLink size={17} />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => openEditModal(project)}
                          aria-label={`Edit ${project.title}`}
                          className="rounded-lg p-2 text-[#00C8C8] hover:bg-[#00C8C8]/10"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleDelete(project)}
                          disabled={deletingId !== null}
                          aria-label={`Delete ${project.title}`}
                          className="rounded-lg p-2 text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                        >
                          {deletingId === project.id ? (
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={17} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-white/10 px-6 py-5">
          <p className="text-xs text-gray-400">
            Page {page} of {lastPage}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => p - 1)}
              aria-label="Previous page"
              className="rounded-lg border border-white/10 p-2 disabled:opacity-30"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              disabled={page >= lastPage || loading}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Next page"
              className="rounded-lg border border-white/10 p-2 disabled:opacity-30"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Add / Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#151520] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <h2
                id="project-modal-title"
                className="text-xl font-semibold"
              >
                {editingProject ? "Edit Project" : "Add Project"}
              </h2>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close modal"
                className="text-gray-400 hover:text-white"
              >
                <X size={22} />
              </button>
            </div>

            <form
              onSubmit={handleSave}
              className="space-y-5 overflow-y-auto p-6"
            >
              <div>
                <label htmlFor="project-title" className="mb-2 block text-sm">
                  Project Title *
                </label>
                <input
                  id="project-title"
                  required
                  maxLength={255}
                  value={form.title}
                  onChange={(e) =>
                    updateForm("title", e.target.value)
                  }
                  className={inputClass}
                  placeholder="Refrigair Expo 2027"
                />
              </div>

              <div>
                <label htmlFor="project-slug" className="mb-2 block text-sm">
                  Slug
                </label>
                <input
                  id="project-slug"
                  value={form.slug}
                  onChange={(e) =>
                    updateForm("slug", e.target.value)
                  }
                  className={inputClass}
                  placeholder="Generated automatically if empty"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="project-category" className="mb-2 block text-sm">
                    Category *
                  </label>
                  <select
                    id="project-category"
                    required
                    value={form.category}
                    onChange={(e) =>
                      updateForm("category", e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">Select category</option>

                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="project-status" className="mb-2 block text-sm">
                    Status
                  </label>
                  <select
                    id="project-status"
                    value={form.status}
                    onChange={(e) =>
                      updateForm(
                        "status",
                        e.target.value as ProjectStatus
                      )
                    }
                    className={inputClass}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="project-description" className="mb-2 block text-sm">
                  Description *
                </label>
                <textarea
                  id="project-description"
                  required
                  rows={3}
                  maxLength={5000}
                  value={form.description}
                  onChange={(e) =>
                    updateForm("description", e.target.value)
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="project-content" className="mb-2 block text-sm">
                  Detailed Content
                </label>
                <textarea
                  id="project-content"
                  rows={4}
                  value={form.content}
                  onChange={(e) =>
                    updateForm("content", e.target.value)
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="project-technologies" className="mb-2 block text-sm">
                  Technologies
                </label>
                <input
                  id="project-technologies"
                  value={form.technologies}
                  onChange={(e) =>
                    updateForm("technologies", e.target.value)
                  }
                  className={inputClass}
                  placeholder="Laravel, React, MySQL"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Separate technologies with commas.
                </p>
              </div>

              <ProjectImageUpload
  value={form.cover_image}
  onChange={(url) => updateForm("cover_image", url)}
/>

              <div>
                <label htmlFor="project-url" className="mb-2 block text-sm">
                  Live Project URL
                </label>
                <input
                  id="project-url"
                  type="url"
                  value={form.project_url}
                  onChange={(e) =>
                    updateForm("project_url", e.target.value)
                  }
                  className={inputClass}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label htmlFor="project-github" className="mb-2 block text-sm">
                  GitHub URL
                </label>
                <input
                  id="project-github"
                  type="url"
                  value={form.github_url}
                  onChange={(e) =>
                    updateForm("github_url", e.target.value)
                  }
                  className={inputClass}
                  placeholder="https://github.com/..."
                />
              </div>

              <div>
                <label htmlFor="project-order" className="mb-2 block text-sm">
                  Sort Order
                </label>
                <input
                  id="project-order"
                  type="number"
                  min="0"
                  value={form.sort_order}
                  onChange={(e) =>
                    updateForm(
                      "sort_order",
                      Number(e.target.value)
                    )
                  }
                  className={inputClass}
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) =>
                    updateForm("featured", e.target.checked)
                  }
                  className="h-4 w-4 accent-[#00C8C8]"
                />
                <Star size={18} className="text-amber-400" />
                Featured Project
              </label>

              {formError && (
                <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-[#00C8C8] px-6 py-3 text-sm font-semibold text-[#0B0B12] disabled:opacity-50"
                >
                  {saving && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  {editingProject
                    ? "Save Changes"
                    : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
