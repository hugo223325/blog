"use client";

import { Download, Upload } from "lucide-react";

interface Props {
  onExport: () => void;
  onImport: () => void;
}

export default function TodoExportImport({ onExport, onImport }: Props) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onExport}
        className="inline-flex items-center gap-1 px-3 py-1.5 font-sans text-xs text-ink-secondary dark:text-[#b8a898] border border-page-sand dark:border-[#2d2922] rounded-md hover:bg-page-warm dark:hover:bg-[#221f1a] transition-colors duration-200"
      >
        <Download size={14} />
        导出
      </button>
      <button
        onClick={onImport}
        className="inline-flex items-center gap-1 px-3 py-1.5 font-sans text-xs text-ink-secondary dark:text-[#b8a898] border border-page-sand dark:border-[#2d2922] rounded-md hover:bg-page-warm dark:hover:bg-[#221f1a] transition-colors duration-200"
      >
        <Upload size={14} />
        导入
      </button>
    </div>
  );
}
