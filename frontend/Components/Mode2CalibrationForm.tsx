"use client";

import React, { useState } from "react";

type MapClickInfo = {
    px: number;
    py: number;
    imageWidth: number;
    imageHeight: number;
};

type Mode2CalibrationFormProps = {
    apiUrl: string;
    lastClick: MapClickInfo | null;
};

export const Mode2CalibrationForm: React.FC<Mode2CalibrationFormProps> = ({
    apiUrl,
    lastClick,
}) => {
    // p1 pixel and gps
    const [p1Px, setP1Px] = useState<string>("");
    const [p1Py, setP1Py] = useState<string>("");
    const [p1Lat, setP1Lat] = useState<string>("");
    const [p1Lon, setP1Lon] = useState<string>("");

    // p2 pixel and gps
    const [p2Px, setP2Px] = useState<string>("");
    const [p2Py, setP2Py] = useState<string>("");
    const [p2Lat, setP2Lat] = useState<string>("");
    const [p2Lon, setP2Lon] = useState<string>("");

    const [status, setStatus] = useState<string | null>(null);

    // copy last click into p1 pixel fields
    const handleUseLastClickForP1 = () => {
        if (!lastClick) {
            setStatus("no last click available. click on the map first.");
            return;
        }
        setP1Px(lastClick.px.toFixed(1));
        setP1Py(lastClick.py.toFixed(1));
        setStatus("p1 pixel set from last click.");
    };

    // copy last click into p2 pixel fields
    const handleUseLastClickForP2 = () => {
        if (!lastClick) {
            setStatus("no last click available. click on the map first.");
            return;
        }
        setP2Px(lastClick.px.toFixed(1));
        setP2Py(lastClick.py.toFixed(1));
        setStatus("p2 pixel set from last click.");
    };

    const handleSaveCalibration = async () => {
        setStatus("saving calibration...");

        try {
            const response = await fetch(`${apiUrl}/mode2/calibration`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    p1_px: Number(p1Px),
                    p1_py: Number(p1Py),
                    p2_px: Number(p2Px),
                    p2_py: Number(p2Py),
                    p1_lat: Number(p1Lat),
                    p1_lon: Number(p1Lon),
                    p2_lat: Number(p2Lat),
                    p2_lon: Number(p2Lon),
                }),
            });

            if (!response.ok) {
                setStatus(`error: ${response.status}`);
                return;
            }

            const data = await response.json();
            console.log("backend response (mode2 calibration):", data);
            setStatus("calibration saved successfully.");
        } catch (error) {
            console.error("calibration request failed:", error);
            setStatus("failed to reach backend.");
        }
    };

    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="font-medium text-slate-100">mode 2 – gps calibration</h2>
                <span className="text-[11px] text-slate-400">define p1 / p2</span>
            </div>

            {lastClick && (
                <p className="text-[11px] text-slate-400">
                    last click on map: px = {lastClick.px.toFixed(1)}, py ={" "}
                    {lastClick.py.toFixed(1)}
                </p>
            )}

            {/* p1 block */}
            <div className="border border-slate-700 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-200 text-xs">point 1 (p1)</span>
                    <button
                        type="button"
                        onClick={handleUseLastClickForP1}
                        className="text-[11px] px-2 py-1 rounded-md border border-slate-700 bg-slate-800/60 hover:bg-slate-700/70"
                    >
                        use last click
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                        <label className="block mb-1 text-slate-300">p1 px</label>
                        <input
                            type="number"
                            value={p1Px}
                            onChange={(e) => setP1Px(e.target.value)}
                            className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-2 py-1 text-xs"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-slate-300">p1 py</label>
                        <input
                            type="number"
                            value={p1Py}
                            onChange={(e) => setP1Py(e.target.value)}
                            className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-2 py-1 text-xs"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-slate-300">p1 lat</label>
                        <input
                            type="number"
                            value={p1Lat}
                            onChange={(e) => setP1Lat(e.target.value)}
                            className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-2 py-1 text-xs"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-slate-300">p1 lon</label>
                        <input
                            type="number"
                            value={p1Lon}
                            onChange={(e) => setP1Lon(e.target.value)}
                            className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-2 py-1 text-xs"
                        />
                    </div>
                </div>
            </div>

            {/* p2 block */}
            <div className="border border-slate-700 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-200 text-xs">point 2 (p2)</span>
                    <button
                        type="button"
                        onClick={handleUseLastClickForP2}
                        className="text-[11px] px-2 py-1 rounded-md border border-slate-700 bg-slate-800/60 hover:bg-slate-700/70"
                    >
                        use last click
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                        <label className="block mb-1 text-slate-300">p2 px</label>
                        <input
                            type="number"
                            value={p2Px}
                            onChange={(e) => setP2Px(e.target.value)}
                            className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-2 py-1 text-xs"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-slate-300">p2 py</label>
                        <input
                            type="number"
                            value={p2Py}
                            onChange={(e) => setP2Py(e.target.value)}
                            className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-2 py-1 text-xs"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-slate-300">p2 lat</label>
                        <input
                            type="number"
                            value={p2Lat}
                            onChange={(e) => setP2Lat(e.target.value)}
                            className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-2 py-1 text-xs"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-slate-300">p2 lon</label>
                        <input
                            type="number"
                            value={p2Lon}
                            onChange={(e) => setP2Lon(e.target.value)}
                            className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-2 py-1 text-xs"
                        />
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={handleSaveCalibration}
                className="inline-flex items-center px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-medium"
            >
                save calibration
            </button>

            {status && (
                <p className="text-[11px] text-slate-400 mt-1">
                    {status}
                </p>
            )}
        </div>
    );
};
