"use client";

import React, { useRef } from "react";

type ImageUploaderProps = {
    onImageSelected: (dataUrl: string | null) => void;
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({
    onImageSelected,
}) => {
    // keep a reference to the hidden <input type="file">
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // called when the user picks a file
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // get the first file from the input
        const file = event.target.files?.[0];
        if (!file) {
            // no file selected, tell parent there is no image
            onImageSelected(null);
            return;
        }

        // FileReader lets us read files in the browser
        const reader = new FileReader();

        // when file reading is finished
        reader.onloadend = () => {
            const result = reader.result;
            // result should be a string like "data:image/png;base64,..."
            if (typeof result === "string") {
                onImageSelected(result);
            } else {
                onImageSelected(null);
            }
        };

        // start reading the file as a data URL
        reader.readAsDataURL(file);
    };

    // called when user clicks the "Choose image…" button
    const handleClickChoose = () => {
        // if the ref is set, open the native file picker
        fileInputRef.current?.click();
    };

    return (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/70 px-4 py-3 text-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-medium text-slate-100">Map image</h2>
                    <p className="text-xs text-slate-400">
                        Upload a .jpg or .png image to use as your map.
                    </p>
                </div>
            </div>

            <button
                type="button"
                onClick={handleClickChoose}
                className="mt-1 inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-100 hover:bg-slate-700/70"
            >
                Choose image…
            </button>

            <input
                ref={fileInputRef}                     // connect ref to this input
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"                     // hide the real input
                onChange={handleFileChange}            // called after user selects a file
            />
        </div>
    );
};
