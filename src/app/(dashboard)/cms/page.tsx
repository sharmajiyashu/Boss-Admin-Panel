"use client";

import React, { useState, useEffect } from "react";
import {
  IconDeviceFloppy,
  IconReload,
  IconCopy,
  IconExternalLink,
  IconLoader2,
  IconFileText
} from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cmsService } from "@/lib/services/cmsService";
import { RichTextEditor } from "@/components/RichTextEditor";
import { toast } from "react-toastify";

export default function CMSPage() {
  const queryClient = useQueryClient();
  
  // Active CMS page selection slug
  const [activeSlug, setActiveSlug] = useState("about-us");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const cmsSlugs = [
    { slug: "about-us", label: "About Us" },
    { slug: "terms-and-conditions", label: "Terms & Conditions" },
    { slug: "privacy-policy", label: "Privacy Policy" },
    { slug: "contact-us", label: "Contact Us" }
  ];

  // ── Queries ──
  const { data: pageData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["cmsPage", activeSlug],
    queryFn: () => cmsService.getPageBySlug(activeSlug),
  });

  useEffect(() => {
    if (pageData) {
      setTitle(pageData.title || "");
      setContent(pageData.content || "");
    } else {
      const currentLabel = cmsSlugs.find(s => s.slug === activeSlug)?.label || "";
      setTitle(currentLabel);
      setContent("");
    }
  }, [pageData, activeSlug]);

  // ── Mutations ──
  const saveMutation = useMutation({
    mutationFn: ({ slug, title, content }: { slug: string; title: string; content: string }) =>
      cmsService.upsertPage(slug, { title, content }),
    onSuccess: () => {
      toast.success("CMS page saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["cmsPage", activeSlug] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save CMS Page");
    }
  });

  // ── Handlers ──
  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Page title is required");
      return;
    }
    saveMutation.mutate({
      slug: activeSlug,
      title,
      content,
    });
  };

  const getPublicUrl = (slug: string) => {
    return `https://boss-backend-tan.vercel.app/${slug}`;
  };

  const handleCopyUrl = (slug: string) => {
    const url = getPublicUrl(slug);
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const handleOpenPage = (slug: string) => {
    const url = getPublicUrl(slug);
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-8 font-sans">
      
      {/* Page Header Layout with Dynamic Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-2 border-b border-slate-100 pb-4">
        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <IconFileText className="text-[#B5651D]" size={22} />
            CMS Management
          </h1>
          
          {/* Header CMS Navigation Tabs */}
          <div className="flex flex-wrap gap-2 pt-2">
            {cmsSlugs.map((item) => (
              <button
                key={item.slug}
                onClick={() => setActiveSlug(item.slug)}
                className={twMerge(
                  "h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  activeSlug === item.slug
                    ? "bg-[#B5651D] text-white shadow-md shadow-[#B5651D]/20"
                    : "bg-white border border-slate-100 text-slate-500 hover:text-[#B5651D]"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:self-end">
          <button
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 hover:text-[#B5651D] transition-all disabled:opacity-50 shadow-sm"
            title="Reload content"
          >
            <IconReload 
              size={16} 
              className={twMerge((isLoading || isRefetching) && "animate-spin")} 
            />
          </button>

          <button
            onClick={handleSave}
            disabled={saveMutation.isPending || isLoading}
            className="h-9 px-4 rounded-xl bg-[linear-gradient(268.96deg,#B5651D_0.19%,#FE9738_99.72%)] text-white text-[11px] font-black uppercase tracking-widest shadow-md shadow-[#B5651D]/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2 border-none outline-none"
          >
            {saveMutation.isPending ? (
              <IconLoader2 size={14} className="animate-spin" />
            ) : (
              <IconDeviceFloppy size={14} />
            )}
            Save Page
          </button>
        </div>
      </div>

      {/* Editor & Workspace Content */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="flex h-96 flex-col items-center justify-center gap-3 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <IconLoader2 className="h-8 w-8 animate-spin text-[#B5651D]/20" />
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Loading page workspace...</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
            
            {/* Title field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Page Header / Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-100 bg-slate-50/20 px-3 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#B5651D]/25 focus:border-[#B5651D]/40"
                placeholder="Page Title"
              />
            </div>

            {/* Rich Text Editor */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Page HTML Content</label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Type dynamic text or compose content layout here..."
                editorKey={`${activeSlug}-${pageData?.updatedAt || "new"}`}
                minHeight="350px"
              />
            </div>

            {/* Quick Link bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Public Link</p>
                <p className="text-[11px] font-bold text-slate-600 truncate max-w-sm sm:max-w-md mt-1">
                  {getPublicUrl(activeSlug)}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopyUrl(activeSlug)}
                  className="h-9 px-3 flex items-center justify-center gap-1.5 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 text-slate-500 active:scale-95 transition-all text-[10px] font-bold shadow-sm"
                >
                  <IconCopy size={14} />
                  Copy Link
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenPage(activeSlug)}
                  className="h-9 px-3 flex items-center justify-center gap-1.5 rounded-lg border border-[#B5651D]/10 bg-[#B5651D]/5 hover:bg-[#B5651D]/10 text-[#B5651D] active:scale-95 transition-all text-[10px] font-bold"
                >
                  <IconExternalLink size={14} />
                  Open Live Page
                </button>
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
