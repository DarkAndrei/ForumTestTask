import { API_BASE } from "../apiConfig";

export const getFileUrl = (filePath) => {
    if (!filePath) return null;

    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
        return filePath;
    }

    return `${API_BASE}${filePath}`;
};

export const validateFile = async (file) => {
    if (!file) return true;

    const maxImageSize = 5 * 1024 * 1024; // 5MB
    const maxTxtSize = 100 * 1024; // 100KB

    const allowedImageTypes = ["image/jpeg", "image/png", "image/gif"];
    const allowedTextExtensions = [".txt"];

    const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

    console.log("allowedImageTypes.includes(file.type)", allowedImageTypes.includes(file.type));

    if (allowedImageTypes.includes(file.type)) {
        console.log("Validating image dimensions...");
        if (file.size === 0 || file.size > maxImageSize) {
            return false;
        }

        console.log("Checking image dimensions...");

        const isValidDimensions = await new Promise((resolve) => {
            const img = new Image();
            const url = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve(img.width <= 5000 && img.height <= 5000);
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve(false);
            };

            img.src = url;
        });

        return isValidDimensions;
    }

    if (allowedTextExtensions.includes(extension)) {
        if (file.size === 0 || file.size > maxTxtSize) {
            return false;
        }

        const content = await file.text();

        if (content.toLowerCase().includes("<script") ||
            content.toLowerCase().includes("<html")) {
            return false;
        }

        return true;
    }

    return false;
};

export const resizeImage = (file) => {
    const targetWidth = 320;
    const targetHeight = 240;

    if (!file) return null;

    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            const ratio = Math.min(
                targetWidth / img.width,
                targetHeight / img.height,
                1
            );

            const newWidth = Math.round(img.width * ratio);
            const newHeight = Math.round(img.height * ratio);

            const canvas = document.createElement("canvas");
            canvas.width = newWidth;
            canvas.height = newHeight;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            canvas.toBlob(
                (blob) => {
                    if (!blob) return reject(new Error("Resize failed"));

                    const resizedFile = new File([blob], file.name, {
                        type: file.type,
                    });

                    resolve(resizedFile);
                },
                file.type,
                0.9
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Invalid image"));
        };

        img.src = url;
    });
};
