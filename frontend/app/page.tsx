"use client";

import { useState } from "react";
import { ImageUploader } from "../Components/ImageUploader";
import { AxisRangeForm } from "../Components/AxisRangeForm";
import { MapViewer } from "../Components/MapViewer";
import { Mode2CalibrationForm } from "../Components/Mode2CalibrationForm";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

type MapClickInfo = {
  px: number;
  py: number;
  imageWidth: number;
  imageHeight: number;
};

export default function Home() {
  const [mode, setMode] = useState<1 | 2>(1);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [lastClick, setLastClick] = useState<MapClickInfo | null>(null);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
      <div className="w-full max-w-6xl h-[90vh] rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur px-6 py-5 flex flex-col">
        {/* header */}
        <header className="mb-3 flex flex-col gap-3">
          {/* mode buttons row */}
          <div className="flex gap-2 text-xs">
            <button
              className={`px-3 py-1 rounded-full border ${mode === 1
                  ? "bg-blue-600 text-white border-blue-500"
                  : "bg-slate-800 text-slate-300 border-slate-600"
                }`}
              onClick={() => setMode(1)}
            >
              mode 1
            </button>
            <button
              className={`px-3 py-1 rounded-full border ${mode === 2
                  ? "bg-blue-600 text-white border-blue-500"
                  : "bg-slate-800 text-slate-300 border-slate-600"
                }`}
              onClick={() => setMode(2)}
            >
              mode 2
            </button>
          </div>

          {/* title + tech badge row */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                map coordinate tool
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {mode === 1
                  ? "mode 1: upload a map, set the axis range, then click on the map to get coordinates, distance, and angle from (0,0)."
                  : "mode 2: use calibration points with gps to get latitude / longitude for any click on the map."}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
              <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                fastapi + next.js
              </span>
            </div>
          </div>
        </header>

        {/* content grid: left = controls, right = map */}
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)] flex-1">
          {/* left column: controls */}
          <div className="flex flex-col gap-4 overflow-hidden">
            <ImageUploader onImageSelected={setImageDataUrl} />

            {mode === 1 ? (
              <AxisRangeForm apiUrl={API_URL} />
            ) : (
              <Mode2CalibrationForm apiUrl={API_URL} lastClick={lastClick} />
            )}
          </div>

          {/* right column: map viewer */}
          <div className="h-full overflow-hidden">
            <MapViewer
              imageDataUrl={imageDataUrl}
              apiUrl={API_URL}
              mode={mode}
              onMapClick={setLastClick}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
















// "use client";

// import { useState } from "react";
// import { ImageUploader } from "../Components/ImageUploader";
// import { AxisRangeForm } from "../Components/AxisRangeForm";
// import { MapViewer } from "../Components/MapViewer";

// const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

// export default function Home() {
//   const [mode, setMode] = useState<1 | 2>(1);
//   const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

//   return (
//     <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
//       <div className="w-full max-w-6xl h-[90vh] rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur px-6 py-5 flex flex-col">
//         {/* Header */}
//         <header className="mb-3 flex flex-col gap-3">
//           {/* Mode buttons row */}
//           <div className="flex gap-2 text-xs">
//             <button
//               className={`px-3 py-1 rounded-full border ${mode === 1
//                   ? "bg-blue-600 text-white border-blue-500"
//                   : "bg-slate-800 text-slate-300 border-slate-600"
//                 }`}
//               onClick={() => setMode(1)}
//             >
//               Mode 1
//             </button>
//             <button
//               className={`px-3 py-1 rounded-full border ${mode === 2
//                   ? "bg-blue-600 text-white border-blue-500"
//                   : "bg-slate-800 text-slate-300 border-slate-600"
//                 }`}
//               onClick={() => setMode(2)}
//             >
//               Mode 2
//             </button>
//           </div>

//           {/* Title + tech badge row */}
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-xl font-semibold tracking-tight">
//                 Map Coordinate Tool
//               </h1>
//               <p className="text-xs text-slate-400 mt-1">
//                 {mode === 1
//                   ? "Mode 1: Upload a map, set the axis range, then click on the map to get coordinates, distance, and angle from (0,0)."
//                   : "Mode 2: Use calibration points to map clicks on the image to GPS coordinates."}
//               </p>
//             </div>
//             <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
//               <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
//                 FastAPI + Next.js
//               </span>
//             </div>
//           </div>
//         </header>

//         {/* Content grid: left = controls, right = map */}
//         <div className="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)] flex-1">
//           {/* Left column: controls */}
//           <div className="flex flex-col gap-4 overflow-hidden">
//             <ImageUploader onImageSelected={setImageDataUrl} />

//             {mode === 1 ? (
//               <AxisRangeForm apiUrl={API_URL} />
//             ) : (
//               <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm">
//                 <h2 className="font-medium text-slate-100">Mode 2 – GPS (coming)</h2>
//                 <p className="text-xs text-slate-400 mt-1">
//                   Here we will define calibration points on the map and their GPS
//                   coordinates.
//                 </p>
//               </div>
//             )}
//           </div>

//           {/* Right column: map viewer */}
//           <div className="h-full overflow-hidden">
//             <MapViewer imageDataUrl={imageDataUrl} apiUrl={API_URL} />
//           </div>
//         </div>
//       </div>
//     </main>
//   );
// }
