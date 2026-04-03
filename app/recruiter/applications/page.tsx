"use client";

import React, { useEffect, useState } from "react";

export default function RecruiterApplicationsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);

  const statusOptions = [
    "Applied",
    "In Review",
    "Shortlisted",
    "Screening Call",
    "Interview Scheduled",
    "Offer in Progress",
    "Offer Accepted",
    "Offer Denied",
  ];

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
  }, []);

  const updateStatus = async (appId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/applications", {
        method: "PUT",
        headers: Object.assign({ "Content-Type": "application/json" }, token ? { Authorization: `Bearer ${token}` } : {}),
        body: JSON.stringify({ id: appId, status: newStatus }),
      });
      const data = await res.json();
      if (data?.success && data.application) {
        setApps((prev) => prev.map((a) => (a.id === appId ? data.application : a)));
        try {
          const bc = new BroadcastChannel("applications-updates");
          bc.postMessage({ type: "status-update", id: appId, status: newStatus });
          bc.close();
        } catch (e) {
          // BroadcastChannel may not be available in all environments
        }
      } else {
        console.error("Failed to update status", data?.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openView = (app: any) => setSelectedApp(app);
  const closeView = () => setSelectedApp(null);

  if (loading) return <div className="p-6">Loading applications...</div>;

  // Group by job
  const grouped: Record<string, any[]> = {};
  apps.forEach((a) => {
    const jobId = a.job?.id || "unknown";
    if (!grouped[jobId]) grouped[jobId] = [];
    grouped[jobId].push(a);
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Applications Received</h1>
      {Object.keys(grouped).length === 0 ? (
        <div>No applications yet.</div>
      ) : (
        Object.entries(grouped).map(([jobId, list]) => (
          <div key={jobId} className="mb-6">
            <h2 className="font-semibold">{list[0].job?.title || "(Job removed)"}</h2>
            <div className="mt-2 space-y-3">
              {list.map((a: any) => (
                <div key={a.id} className="border p-3 rounded bg-white flex items-center justify-between">
                  <div>
                    <div className="font-medium">{a.firstName} {a.lastName}</div>
                    <div className="text-sm text-gray-600">{a.email} • {a.phone}</div>
                  </div>
                  <div className="text-sm">
                    <div className="mb-2">Status:
                      <select
                        className="ml-2 border rounded px-2 py-1"
                        value={a.status || "Applied"}
                        onChange={(e) => updateStatus(a.id, e.target.value)}
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2 items-center">
                      <button className="text-sm text-emerald-600" onClick={() => openView(a)}>View</button>
                      {a.resumeUrl && <a className="text-emerald-600 text-sm" href={a.resumeUrl} target="_blank" rel="noreferrer">Resume</a>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
      {selectedApp && <DetailsModal app={selectedApp} onClose={closeView} />}
    </div>
  );
}

function DetailsModal({ app, onClose }: { app: any; onClose: () => void }) {
  if (!app) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded p-6 w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Application Details</h3>
          <button onClick={onClose} className="text-gray-600">Close</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><strong>Name</strong><div>{app.firstName} {app.lastName}</div></div>
          <div><strong>Email</strong><div>{app.email}</div></div>
          <div><strong>Phone</strong><div>{app.phone}</div></div>
          <div><strong>DOB</strong><div>{app.dob}</div></div>
          <div><strong>Gender</strong><div>{app.gender}</div></div>
          <div><strong>Status</strong><div>{app.status}</div></div>
          <div className="col-span-2">
            <strong>Qualifications</strong>
            <div className="whitespace-pre-wrap">{app.qualifications}</div>
          </div>
          <div className="col-span-2">
            <strong>Current Employment</strong>
            <div className="whitespace-pre-wrap">{app.currentEmployment}</div>
          </div>
          <div className="col-span-2">
            <strong>Certifications</strong>
            <div className="whitespace-pre-wrap">{app.certifications}</div>
          </div>
          <div className="col-span-2">
            <strong>Why</strong>
            <div className="whitespace-pre-wrap">{app.why}</div>
          </div>
          <div>
            <strong>LinkedIn</strong>
            <div>{app.linkedin}</div>
          </div>
          <div>
            <strong>GitHub</strong>
            <div>{app.github}</div>
          </div>
          {app.resumeUrl && (
            <div className="col-span-2">
              <strong>Resume</strong>
              <div><a className="text-emerald-600" href={app.resumeUrl} target="_blank" rel="noreferrer">Open Resume</a></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
