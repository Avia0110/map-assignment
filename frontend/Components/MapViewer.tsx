"use client";

import React, { useRef, useState } from "react";

type Mode1ClickResult = {
    x: number;
    y: number;
    distance: number;
    angle_degrees: number;
};

type Mode2ClickResult = {
    lat: number;
    lon: number;
};

type MapClickInfo = {
    px: number;
    py: number;
    imageWidth: number;
    imageHeight: number;
};

type MapViewerProps = {
    imageDataUrl: string | null;
    apiUrl: string;
    mode: 1 | 2;
    onMapClick?: (info: MapClickInfo) => void;
};

// marker stored in normalized coords + gps
type Marker = {
    u: number;   // 0..1 from left to right
    v: number;   // 0..1 from top to bottom
    lat: number;
    lon: number;
};

export const MapViewer: React.FC<MapViewerProps> = ({
    imageDataUrl,
    apiUrl,
    mode,
    onMapClick,
}) => {
    const imgRef = useRef<HTMLImageElement | null>(null);

    // status after saving the map
    const [saveStatus, setSaveStatus] = useState<string | null>(null);

    // last click in pixel coordinates inside the image
    const [lastClickPxPy, setLastClickPxPy] =
        useState<{ px: number; py: number } | null>(null);

    // result returned from backend for last click (mode 1)
    const [mode1Result, setMode1Result] = useState<Mode1ClickResult | null>(null);

    // result returned from backend for last click (mode 2)
    const [mode2Result, setMode2Result] = useState<Mode2ClickResult | null>(null);

    // text status for click action
    const [clickStatus, setClickStatus] = useState<string | null>(null);

    // zoom factor for image (1 = no zoom)
    const [zoom, setZoom] = useState<number>(1);

    // single icon on the map with its gps
    const [marker, setMarker] = useState<Marker | null>(null);

    // send the map image (data url) to the backend
    const handleSaveMap = async () => {
        if (!imageDataUrl) {
            setSaveStatus("please upload an image first.");
            return;
        }

        try {
            setSaveStatus("saving map to backend...");

            const response = await fetch(`${apiUrl}/mode1/map-image`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ link: imageDataUrl }),
            });

            if (!response.ok) {
                setSaveStatus(`error: ${response.status}`);
                return;
            }

            const data = await response.json();
            console.log("backend response (map-image):", data);
            setSaveStatus("map image saved successfully.");
        } catch (error) {
            console.error("request failed:", error);
            setSaveStatus("failed to reach backend.");
        }
    };

    // user clicks zoom in
    const handleZoomIn = () => {
        // keep zoom in a reasonable range
        setZoom((z) => Math.min(z + 0.25, 3));
    };

    // user clicks zoom out
    const handleZoomOut = () => {
        setZoom((z) => Math.max(z - 0.25, 0.5));
    };

    // handle user click on the image
    const handleImageClick = async (
        event: React.MouseEvent<HTMLImageElement>
    ) => {
        if (!imgRef.current) return;

        // get the position and size of the image on the screen
        const rect = imgRef.current.getBoundingClientRect();

        // clientx / clienty are mouse coords in the window
        // subtract image left / top to get position inside the image
        const px = event.clientX - rect.left;
        const py = event.clientY - rect.top;

        const imageWidth = rect.width;
        const imageHeight = rect.height;

        setLastClickPxPy({ px, py });

        // inform parent about the click (used by mode 2 calibration)
        if (onMapClick) {
            onMapClick({ px, py, imageWidth, imageHeight });
        }

        try {
            setClickStatus("sending click to backend...");

            if (mode === 1) {
                // mode 1: axis / distance / angle
                const response = await fetch(`${apiUrl}/mode1/click`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        px,
                        py,
                        image_width: imageWidth,
                        image_height: imageHeight,
                    }),
                });

                if (!response.ok) {
                    setClickStatus(`error from backend: ${response.status}`);
                    setMode1Result(null);
                    setMode2Result(null);
                    return;
                }

                const data: Mode1ClickResult = await response.json();
                console.log("backend response (mode1 click):", data);
                setMode1Result(data);
                setMode2Result(null);
                setClickStatus("click processed successfully.");

                // marker is only used in mode 2, so clear it here
                setMarker(null);
            } else {
                // mode 2: gps coordinates
                const response = await fetch(`${apiUrl}/mode2/click`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        px,
                        py,
                        image_width: imageWidth,
                        image_height: imageHeight,
                    }),
                });

                if (!response.ok) {
                    setClickStatus(`error from backend: ${response.status}`);
                    setMode1Result(null);
                    setMode2Result(null);
                    return;
                }

                const data: Mode2ClickResult = await response.json();
                console.log("backend response (mode2 click):", data);
                setMode2Result(data);
                setMode1Result(null);
                setClickStatus("click processed successfully.");

                // normalized position of click inside the image (0..1)
                const u = imageWidth > 0 ? px / imageWidth : 0;
                const v = imageHeight > 0 ? py / imageHeight : 0;

                // save marker so icon and gps can be shown and kept stable on zoom
                setMarker({
                    u,
                    v,
                    lat: data.lat,
                    lon: data.lon,
                });
            }
        } catch (error) {
            console.error("click request failed:", error);
            setClickStatus("failed to reach backend.");
            setMode1Result(null);
            setMode2Result(null);
        }
    };

    // no image yet → compact placeholder card
    if (!imageDataUrl) {
        return (
            <div className="h-full rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/60 flex items-center justify-center text-xs text-slate-500">
                upload an image on the left to preview and click on the map.
            </div>
        );
    }

    return (
        <div className="h-full rounded-2xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col gap-3">
            {/* title row */}
            <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-100">
                    map preview & click
                </span>
                <span className="text-[11px] text-slate-400">
                    click anywhere on the map to sample coordinates
                </span>
            </div>

            {/* zoom controls: only in mode 2 */}
            {mode === 2 && (
                <div className="flex justify-end items-center gap-2 text-[11px]">
                    <button
                        type="button"
                        onClick={handleZoomOut}
                        className="px-2 py-1 rounded-md border border-slate-700 bg-slate-800/80 hover:bg-slate-700/90"
                    >
                        -
                    </button>
                    <button
                        type="button"
                        onClick={handleZoomIn}
                        className="px-2 py-1 rounded-md border border-slate-700 bg-slate-800/80 hover:bg-slate-700/90"
                    >
                        +
                    </button>
                    <span className="text-slate-300">
                        {zoom.toFixed(2)}x
                    </span>
                </div>
            )}

            {/* image area with marker and zoom */}
            <div className="flex-1 rounded-xl bg-black/60 border border-slate-800 overflow-auto flex items-center justify-center">
                <div
                    className="relative inline-block"
                    style={{
                        // only zoom image in mode 2, keep scale 1 in mode 1
                        transform: mode === 2 ? `scale(${zoom})` : "scale(1)",
                        transformOrigin: "center center",
                    }}
                >
                    <img
                        ref={imgRef}
                        src={imageDataUrl}
                        alt="selected map"
                        className="max-h-[420px] max-w-[640px] object-contain cursor-crosshair"
                        onClick={handleImageClick}
                    />

                    {/* icon marker that stays on same logical map point when zooming */}
                    {marker && (
                        <div
                            className="absolute w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow"
                            style={{
                                left: `${marker.u * 100}%`,
                                top: `${marker.v * 100}%`,
                                transform: "translate(-50%, -100%)",
                            }}
                            title={`lat: ${marker.lat}, lon: ${marker.lon}`}
                        />
                    )}
                </div>
            </div>

            {/* save button + status */}
            <div className="flex items-center justify-between gap-2">
                <button
                    onClick={handleSaveMap}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-medium shadow-sm"
                >
                    save map to backend
                </button>
                {saveStatus && (
                    <p className="text-[11px] text-slate-400 truncate">{saveStatus}</p>
                )}
            </div>

            {/* click info */}
            <div className="rounded-xl bg-slate-950/70 border border-slate-800 px-3 py-2 text-xs space-y-1">
                <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">last click</span>
                    {clickStatus && (
                        <span className="text-[10px] text-slate-400">
                            {clickStatus}
                        </span>
                    )}
                </div>

                {lastClickPxPy ? (
                    <p className="text-slate-300">
                        pixels: px = {lastClickPxPy.px.toFixed(1)}, py ={" "}
                        {lastClickPxPy.py.toFixed(1)}
                    </p>
                ) : (
                    <p className="text-slate-500">
                        click on the map above to see pixel and axis / gps coordinates.
                    </p>
                )}

                {/* mode 1 result */}
                {mode === 1 && mode1Result && (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-1">
                        <p className="text-slate-300">
                            x ={" "}
                            <span className="font-mono">
                                {mode1Result.x.toFixed(2)}
                            </span>
                        </p>
                        <p className="text-slate-300">
                            y ={" "}
                            <span className="font-mono">
                                {mode1Result.y.toFixed(2)}
                            </span>
                        </p>
                        <p className="text-slate-300">
                            dist ={" "}
                            <span className="font-mono">
                                {mode1Result.distance.toFixed(2)}
                            </span>
                        </p>
                        <p className="text-slate-300">
                            angle ={" "}
                            <span className="font-mono">
                                {mode1Result.angle_degrees.toFixed(2)}°
                            </span>
                        </p>
                    </div>
                )}

                {/* mode 2 result */}
                {mode === 2 && mode2Result && (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-1">
                        <p className="text-slate-300">
                            lat ={" "}
                            <span className="font-mono">
                                {mode2Result.lat.toFixed(8)}
                            </span>
                        </p>
                        <p className="text-slate-300">
                            lon ={" "}
                            <span className="font-mono">
                                {mode2Result.lon.toFixed(8)}
                            </span>
                        </p>
                    </div>
                )}

                {/* marker info */}
                {mode === 2 && marker && (
                    <p className="text-[11px] text-slate-400 mt-1">
                        marker gps: lat {marker.lat.toFixed(8)}, lon{" "}
                        {marker.lon.toFixed(8)}
                    </p>
                )}
            </div>
        </div>
    );
};













// "use client";

// import React, { useRef, useState } from "react";

// type Mode1ClickResult = {
//     x: number;
//     y: number;
//     distance: number;
//     angle_degrees: number;
// };

// type Mode2ClickResult = {
//     lat: number;
//     lon: number;
// };

// type MapClickInfo = {
//     px: number;
//     py: number;
//     imageWidth: number;
//     imageHeight: number;
// };

// type MapViewerProps = {
//     imageDataUrl: string | null;
//     apiUrl: string;
//     mode: 1 | 2;
//     onMapClick?: (info: MapClickInfo) => void;
// };

// // marker: stored in normalized coords + gps
// type Marker = {
//     u: number;   // 0..1 (left → right)
//     v: number;   // 0..1 (top → bottom)
//     lat: number;
//     lon: number;
// };

// export const MapViewer: React.FC<MapViewerProps> = ({
//     imageDataUrl,
//     apiUrl,
//     mode,
//     onMapClick,
// }) => {
//     const imgRef = useRef<HTMLImageElement | null>(null);

//     const [saveStatus, setSaveStatus] = useState<string | null>(null);
//     const [lastClickPxPy, setLastClickPxPy] =
//         useState<{ px: number; py: number } | null>(null);

//     const [mode1Result, setMode1Result] = useState<Mode1ClickResult | null>(null);
//     const [mode2Result, setMode2Result] = useState<Mode2ClickResult | null>(null);
//     const [clickStatus, setClickStatus] = useState<string | null>(null);

//     // zoom factor (1 = normal)
//     const [zoom, setZoom] = useState<number>(1);

//     // a single icon on the map with gps
//     const [marker, setMarker] = useState<Marker | null>(null);

//     const handleSaveMap = async () => {
//         if (!imageDataUrl) {
//             setSaveStatus("please upload an image first.");
//             return;
//         }

//         try {
//             setSaveStatus("saving map to backend...");

//             const response = await fetch(`${apiUrl}/mode1/map-image`, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({ link: imageDataUrl }),
//             });

//             if (!response.ok) {
//                 setSaveStatus(`error: ${response.status}`);
//                 return;
//             }

//             const data = await response.json();
//             console.log("backend response (map-image):", data);
//             setSaveStatus("map image saved successfully.");
//         } catch (error) {
//             console.error("request failed:", error);
//             setSaveStatus("failed to reach backend.");
//         }
//     };

//     const handleZoomIn = () => {
//         // keep zoom in a reasonable range
//         setZoom((z) => Math.min(z + 0.25, 3));
//     };

//     const handleZoomOut = () => {
//         setZoom((z) => Math.max(z - 0.25, 0.5));
//     };

//     const handleImageClick = async (
//         event: React.MouseEvent<HTMLImageElement>
//     ) => {
//         if (!imgRef.current) return;

//         const rect = imgRef.current.getBoundingClientRect();
//         const px = event.clientX - rect.left;
//         const py = event.clientY - rect.top;

//         const imageWidth = rect.width;
//         const imageHeight = rect.height;

//         setLastClickPxPy({ px, py });

//         // notify parent (for mode2 calibration)
//         if (onMapClick) {
//             onMapClick({ px, py, imageWidth, imageHeight });
//         }

//         try {
//             setClickStatus("sending click to backend...");

//             if (mode === 1) {
//                 const response = await fetch(`${apiUrl}/mode1/click`, {
//                     method: "POST",
//                     headers: {
//                         "Content-Type": "application/json",
//                     },
//                     body: JSON.stringify({
//                         px,
//                         py,
//                         image_width: imageWidth,
//                         image_height: imageHeight,
//                     }),
//                 });

//                 if (!response.ok) {
//                     setClickStatus(`error from backend: ${response.status}`);
//                     setMode1Result(null);
//                     setMode2Result(null);
//                     return;
//                 }

//                 const data: Mode1ClickResult = await response.json();
//                 console.log("backend response (mode1 click):", data);
//                 setMode1Result(data);
//                 setMode2Result(null);
//                 setClickStatus("click processed successfully.");

//                 // marker is for mode2 only
//                 setMarker(null);
//             } else {
//                 const response = await fetch(`${apiUrl}/mode2/click`, {
//                     method: "POST",
//                     headers: {
//                         "Content-Type": "application/json",
//                     },
//                     body: JSON.stringify({
//                         px,
//                         py,
//                         image_width: imageWidth,
//                         image_height: imageHeight,
//                     }),
//                 });

//                 if (!response.ok) {
//                     setClickStatus(`error from backend: ${response.status}`);
//                     setMode1Result(null);
//                     setMode2Result(null);
//                     return;
//                 }

//                 const data: Mode2ClickResult = await response.json();
//                 console.log("backend response (mode2 click):", data);
//                 setMode2Result(data);
//                 setMode1Result(null);
//                 setClickStatus("click processed successfully.");

//                 // normalized position for marker, so zoom will not move it logically
//                 const u = imageWidth > 0 ? px / imageWidth : 0;
//                 const v = imageHeight > 0 ? py / imageHeight : 0;

//                 setMarker({
//                     u,
//                     v,
//                     lat: data.lat,
//                     lon: data.lon,
//                 });
//             }
//         } catch (error) {
//             console.error("click request failed:", error);
//             setClickStatus("failed to reach backend.");
//             setMode1Result(null);
//             setMode2Result(null);
//         }
//     };

//     if (!imageDataUrl) {
//         return (
//             <div className="h-full rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/60 flex items-center justify-center text-xs text-slate-500">
//                 upload an image on the left to preview and click on the map.
//             </div>
//         );
//     }

//     return (
//         <div className="h-full rounded-2xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col gap-3">
//             {/* title row */}
//             <div className="flex items-center justify-between text-sm">
//                 <span className="font-medium text-slate-100">
//                     map preview & click
//                 </span>
//                 <span className="text-[11px] text-slate-400">
//                     click anywhere on the map to sample coordinates
//                 </span>
//             </div>

//             {/* zoom controls: only for mode 2 */}
//             {mode === 2 && (
//                 <div className="flex justify-end items-center gap-2 text-[11px]">
//                     <button
//                         type="button"
//                         onClick={handleZoomOut}
//                         className="px-2 py-1 rounded-md border border-slate-700 bg-slate-800/80 hover:bg-slate-700/90"
//                     >
//                         -
//                     </button>
//                     <button
//                         type="button"
//                         onClick={handleZoomIn}
//                         className="px-2 py-1 rounded-md border border-slate-700 bg-slate-800/80 hover:bg-slate-700/90"
//                     >
//                         +
//                     </button>
//                     <span className="text-slate-300">
//                         {zoom.toFixed(2)}x
//                     </span>
//                 </div>
//             )}


//             {/* image area with marker and zoom */}
//             <div className="flex-1 rounded-xl bg-black/60 border border-slate-800 overflow-auto flex items-center justify-center">
//                 <div
//                     className="relative inline-block"
//                     style={{
//                         transform: `scale(${zoom})`,
//                         transformOrigin: "center center",
//                     }}
//                 >
//                     <img
//                         ref={imgRef}
//                         src={imageDataUrl}
//                         alt="selected map"
//                         className="max-h-[420px] max-w-[640px] object-contain cursor-crosshair"
//                         onClick={handleImageClick}
//                     />

//                     {/* marker icon */}
//                     {marker && (
//                         <div
//                             className="absolute w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow"
//                             style={{
//                                 left: `${marker.u * 100}%`,
//                                 top: `${marker.v * 100}%`,
//                                 transform: "translate(-50%, -100%)",
//                             }}
//                             title={`lat: ${marker.lat}, lon: ${marker.lon}`}
//                         />
//                     )}
//                 </div>
//             </div>

//             {/* save button + status */}
//             <div className="flex items-center justify-between gap-2">
//                 <button
//                     onClick={handleSaveMap}
//                     className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-medium shadow-sm"
//                 >
//                     save map to backend
//                 </button>
//                 {saveStatus && (
//                     <p className="text-[11px] text-slate-400 truncate">{saveStatus}</p>
//                 )}
//             </div>

//             {/* click info */}
//             <div className="rounded-xl bg-slate-950/70 border border-slate-800 px-3 py-2 text-xs space-y-1">
//                 <div className="flex items-center justify-between">
//                     <span className="font-semibold text-slate-200">last click</span>
//                     {clickStatus && (
//                         <span className="text-[10px] text-slate-400">
//                             {clickStatus}
//                         </span>
//                     )}
//                 </div>

//                 {lastClickPxPy ? (
//                     <p className="text-slate-300">
//                         pixels: px = {lastClickPxPy.px.toFixed(1)}, py ={" "}
//                         {lastClickPxPy.py.toFixed(1)}
//                     </p>
//                 ) : (
//                     <p className="text-slate-500">
//                         click on the map above to see pixel and axis / gps coordinates.
//                     </p>
//                 )}

//                 {/* mode 1 result */}
//                 {mode === 1 && mode1Result && (
//                     <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-1">
//                         <p className="text-slate-300">
//                             x ={" "}
//                             <span className="font-mono">
//                                 {mode1Result.x.toFixed(2)}
//                             </span>
//                         </p>
//                         <p className="text-slate-300">
//                             y ={" "}
//                             <span className="font-mono">
//                                 {mode1Result.y.toFixed(2)}
//                             </span>
//                         </p>
//                         <p className="text-slate-300">
//                             dist ={" "}
//                             <span className="font-mono">
//                                 {mode1Result.distance.toFixed(2)}
//                             </span>
//                         </p>
//                         <p className="text-slate-300">
//                             angle ={" "}
//                             <span className="font-mono">
//                                 {mode1Result.angle_degrees.toFixed(2)}°
//                             </span>
//                         </p>
//                     </div>
//                 )}

//                 {/* mode 2 result */}
//                 {mode === 2 && mode2Result && (
//                     <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-1">
//                         <p className="text-slate-300">
//                             lat ={" "}
//                             <span className="font-mono">
//                                 {mode2Result.lat.toFixed(8)}
//                             </span>
//                         </p>
//                         <p className="text-slate-300">
//                             lon ={" "}
//                             <span className="font-mono">
//                                 {mode2Result.lon.toFixed(8)}
//                             </span>
//                         </p>
//                     </div>
//                 )}

//                 {/* marker info */}
//                 {mode === 2 && marker && (
//                     <p className="text-[11px] text-slate-400 mt-1">
//                         marker gps: lat {marker.lat.toFixed(8)}, lon{" "}
//                         {marker.lon.toFixed(8)}
//                     </p>
//                 )}
//             </div>
//         </div>
//     );
// };


















