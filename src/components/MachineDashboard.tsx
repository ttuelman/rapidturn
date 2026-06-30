"use client";

import type { Order } from "@/lib/types";
import { useEffect, useState } from "react";

export function MachineDashboard() {
  const [queue, setQueue] = useState<
    { orderId: string; orderNumber: string; programNumber: string; status: string; quantity: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const res = await fetch("/api/machine");
    const data = await res.json();
    setQueue(data.queue || []);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, []);

  const runAction = async (orderId: string, action: string) => {
    await fetch("/api/machine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, action }),
    });
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-steel-900">Machine Queue</h1>
          <p className="text-sm text-steel-500">Haas CL-1 — live production queue</p>
        </div>
        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
          Online
        </span>
      </div>

      {loading ? (
        <p className="text-steel-500">Loading queue…</p>
      ) : queue.length === 0 ? (
        <div className="rounded-xl border border-dashed border-steel-200 p-12 text-center text-steel-500">
          No jobs in queue
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-steel-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-steel-100 bg-steel-50">
              <tr>
                <th className="px-4 py-3 font-medium text-steel-600">Order</th>
                <th className="px-4 py-3 font-medium text-steel-600">Program</th>
                <th className="px-4 py-3 font-medium text-steel-600">Qty</th>
                <th className="px-4 py-3 font-medium text-steel-600">Status</th>
                <th className="px-4 py-3 font-medium text-steel-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((job) => (
                <tr key={job.orderId} className="border-b border-steel-50">
                  <td className="px-4 py-3 font-mono">{job.orderNumber}</td>
                  <td className="px-4 py-3 font-mono">{job.programNumber}</td>
                  <td className="px-4 py-3">{job.quantity}</td>
                  <td className="px-4 py-3 capitalize">{job.status}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {job.status === "queued" && (
                        <button
                          onClick={() => runAction(job.orderId, "dispatch")}
                          className="rounded bg-rapid-100 px-2 py-1 text-xs font-medium text-rapid-700 hover:bg-rapid-200"
                        >
                          Dispatch
                        </button>
                      )}
                      {job.status === "dispatched" && (
                        <button
                          onClick={() => runAction(job.orderId, "start")}
                          className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700"
                        >
                          Start
                        </button>
                      )}
                      {job.status === "running" && (
                        <button
                          onClick={() => runAction(job.orderId, "complete")}
                          className="rounded bg-steel-100 px-2 py-1 text-xs font-medium text-steel-700"
                        >
                          Complete
                        </button>
                      )}
                      <a
                        href={`/api/gcode/${job.orderId}`}
                        className="rounded bg-steel-100 px-2 py-1 text-xs font-medium text-steel-700"
                      >
                        G-code
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
