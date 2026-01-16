import React from "react";

export default function GoogleAuthLoading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50">
      {/* Logo image */}
      <div className="mb-6">
        <img src="/logo.png" alt="movinglines logo" width={80} height={80} className="rounded-xl shadow-lg" />
      </div>
      <div className="text-3xl font-bold tracking-tight text-white mb-2">movinglines</div>
    </div>
  );
}
