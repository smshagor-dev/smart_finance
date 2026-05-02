"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ExternalLink, FileImage, FileSpreadsheet, FileText, FileType2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLiveUpdateListener } from "@/lib/live-client";
import { useToast } from "@/components/ui/toast-provider";
import { formatDate } from "@/lib/utils";

function getFilePresentation(fileType) {
  if (fileType?.startsWith("image/")) {
    return {
      kind: "image",
      icon: FileImage,
      label: "Image",
    };
  }

  if (fileType === "application/pdf") {
    return {
      kind: "document",
      icon: FileText,
      label: "PDF",
    };
  }

  if (fileType?.includes("sheet") || fileType?.includes("excel")) {
    return {
      kind: "document",
      icon: FileSpreadsheet,
      label: "Spreadsheet",
    };
  }

  return {
    kind: "document",
    icon: FileType2,
    label: "Document",
  };
}

export function ReceiptsPage() {
  const [file, setFile] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const toast = useToast();

  async function loadReceipts() {
    const response = await fetch("/api/receipts");
    const data = await response.json();
    setReceipts(data.items || []);
  }

  useEffect(() => {
    let active = true;

    async function load() {
      const response = await fetch("/api/receipts");
      const data = await response.json();
      if (!active) return;
      setReceipts(data.items || []);
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  useLiveUpdateListener(["receipts"], () => {
    loadReceipts();
  });

  async function handleUpload(event) {
    event.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/receipts", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      toast.push("Receipt upload failed", "error");
      return;
    }

    toast.push("Receipt uploaded");
    setFile(null);
    event.target.reset();
    loadReceipts();
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold">Receipt Upload</h2>
        <p className="mt-1 text-sm text-slate-500">Upload images, PDFs, and common document files for receipts, invoices, bills, and supporting finance records.</p>
        <form className="mt-6 flex flex-col gap-4 sm:flex-row" onSubmit={handleUpload}>
          <input
            type="file"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
          <Button type="submit">Upload receipt</Button>
        </form>
        <p className="mt-3 text-xs text-slate-500">Supported: all common image types, PDF, DOC, DOCX, XLS, XLSX, TXT. Max size 10MB.</p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {receipts.map((receipt) => (
          <Card key={receipt.id} className="overflow-hidden">
            {(() => {
              const presentation = getFilePresentation(receipt.fileType);
              const Icon = presentation.icon;

              return presentation.kind === "image" ? (
                <div className="relative h-52 w-full">
                  <Image src={receipt.fileUrl} alt={receipt.originalName} fill className="object-cover" />
                </div>
              ) : (
                <div className="flex h-52 w-full items-center justify-center bg-muted">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="rounded-3xl bg-white p-4 shadow-sm">
                      <Icon className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{presentation.label}</p>
                      <p className="text-xs text-slate-500">{receipt.fileType}</p>
                    </div>
                  </div>
                </div>
              );
            })()}
            <div className="p-4">
              <p className="font-medium">{receipt.originalName}</p>
              <p className="mt-1 text-sm text-slate-500">{receipt.fileType}</p>
              <p className="mt-1 text-xs text-slate-500">Uploaded {formatDate(receipt.uploadedAt)}</p>
              <a href={receipt.fileUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary">
                Open file
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
