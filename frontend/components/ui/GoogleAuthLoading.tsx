import React from "react";

export default function GoogleAuthLoading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50">
      {/* Logo SVG - loads instantly, no external request needed */}
      <div className="mb-6">
        <img src="/logo.svg" alt="movinglines logo" width={80} height={80} className="rounded-xl" />
      </div>
      <div className="text-3xl font-bold tracking-tight text-white mb-2">movinglines</div>
    </div>
  );
}
