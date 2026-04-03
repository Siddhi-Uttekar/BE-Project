"use client";

import React, { useEffect, useState } from "react";

type Application = any;

export default function AppliedJobsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApps() {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch("/api/applications", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const data = await res.json();
        if (data?.applications) setApps(data.applications);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchApps();

    // Listen for status updates from recruiters in other tabs/clients
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("applications-updates");
      bc.onmessage = (ev) => {
        const msg = ev.data;
        if (msg?.type === "status-update") {
          setApps((prev) => prev.map((a) => (a.id === msg.id ? { ...a, status: msg.status } : a)));
        }
      };
    } catch (e) {
      // ignore if BroadcastChannel unsupported
    }

    return () => {
      try {
        bc?.close();
      } catch (e) {}
    };
  }, []);

  if (loading) return <div className="p-6">Loading applications...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Applications</h1>
      {apps.length === 0 ? (
        <div>No applications found.</div>
      ) : (
        <div className="space-y-4">
          {apps.map((a) => (
            <div key={a.id} className="border p-4 rounded bg-white">
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold">{a.job?.title || "(Job removed)"}</div>
                  <div className="text-sm text-gray-600">Applied: {new Date(a.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-sm">
                  <span className="px-2 py-1 rounded bg-slate-100">{a.status}</span>
                </div>
              </div>

              <div className="mt-2 text-sm text-gray-700">
                {a.firstName} {a.lastName} — {a.email} — {a.phone}
              </div>

              {a.resumeUrl && (
                <div className="mt-2">
                  <a href={a.resumeUrl} target="_blank" rel="noreferrer" className="text-emerald-600">
                    View resume
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
