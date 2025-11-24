"use client";

import React, { useState } from "react";

type AxisRangeFormProps = {
    apiUrl: string;
};

export const AxisRangeForm: React.FC<AxisRangeFormProps> = ({ apiUrl }) => {
    const [xMin, setXMin] = useState<string>("-100");
    const [xMax, setXMax] = useState<string>("100");
    const [yMin, setYMin] = useState<string>("-100");
    const [yMax, setYMax] = useState<string>("100");
    const [status, setStatus] = useState<string | null>(null);

    const handleSaveAxisRange = async () => {
        setStatus("Saving axis range...");

        try {
            const response = await fetch(`${apiUrl}/mode1/axis-range`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    x_min: Number(xMin),
                    x_max: Number(xMax),
                    y_min: Number(yMin),
                    y_max: Number(yMax),
                }),
            });

            if (!response.ok) {
                setStatus(`Error: ${response.status}`);
                return;
            }

            setStatus("Axis range saved successfully.");
        } catch (error) {
            console.error("Axis range request failed:", error);
            setStatus("Failed to reach backend.");
        }
    };

    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="font-medium text-slate-100">Axis range (Mode 1)</h2>
                <span className="text-[11px] text-slate-400">X/Y limits</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                    <label className="block mb-1 text-slate-300">X min</label>
                    <input
                        type="number"
                        value={xMin}
                        onChange={(e) => setXMin(e.target.value)}
                        className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-2 py-1 text-xs"
                    />
                </div>

                <div>
                    <label className="block mb-1 text-slate-300">X max</label>
                    <input
                        type="number"
                        value={xMax}
                        onChange={(e) => setXMax(e.target.value)}
                        className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-2 py-1 text-xs"
                    />
                </div>

                <div>
                    <label className="block mb-1 text-slate-300">Y min</label>
                    <input
                        type="number"
                        value={yMin}
                        onChange={(e) => setYMin(e.target.value)}
                        className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-2 py-1 text-xs"
                    />
                </div>

                <div>
                    <label className="block mb-1 text-slate-300">Y max</label>
                    <input
                        type="number"
                        value={yMax}
                        onChange={(e) => setYMax(e.target.value)}
                        className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-2 py-1 text-xs"
                    />
                </div>
            </div>

            <button
                onClick={handleSaveAxisRange}
                className="inline-flex items-center px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-medium"
            >
                Save axis range
            </button>

            {status && (
                <p className="text-[11px] text-slate-400 mt-1">
                    {status}
                </p>
            )}
        </div>
    );
};
