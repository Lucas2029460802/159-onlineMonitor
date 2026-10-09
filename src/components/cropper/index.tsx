import React, { useState, useRef, useEffect, useMemo } from "react";

import CustomImage from "../image";

interface CropperProps {
    imageSrc: string;
    onCrop: (lx: number, ly: number, rx: number, ry: number) => void;
    defaultValue?: CropBoundary;
    height: number;
}

interface CropBoundary {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

const Cropper: React.FC<CropperProps> = (props) => {
    const { imageSrc, onCrop, defaultValue, height } = props;
    const [cropArea, setCropArea] = useState<CropBoundary>(
        defaultValue ?? {
            x1: 50,
            y1: 50,
            x2: 100,
            y2: 100,
        },
    );
    const cropRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const isCropMoving = useRef<boolean>(false);
    const isNWMoving = useRef<boolean>(false);
    const isSEMoving = useRef<boolean>(false);
    const isNEMoving = useRef<boolean>(false);
    const isSWMoving = useRef<boolean>(false);
    const originWidth = useRef<number>(10);
    const originHeight = useRef<number>(10);
    const imgLoaded = useRef<boolean>(false);

    const firstMousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const prevCropArea = useRef<CropBoundary>(
        defaultValue ?? {
            x1: 50,
            y1: 50,
            x2: 100,
            y2: 100,
        },
    );
    const componentWidth = useRef(10);
    const componentHeight = useRef(height);
    const lx = useMemo(() => Math.min(cropArea.x1, cropArea.x2), [cropArea]);
    const ly = useMemo(() => Math.min(cropArea.y1, cropArea.y2), [cropArea]);
    const rx = useMemo(() => Math.max(cropArea.x1, cropArea.x2), [cropArea]);
    const ry = useMemo(() => Math.max(cropArea.y1, cropArea.y2), [cropArea]);

    const limitX = (x: number) =>
        x <= 0 ? 0 : x >= componentWidth.current ? componentWidth.current : x;

    const limitY = (y: number) =>
        y <= 0 ? 0 : y >= componentHeight.current ? componentHeight.current : y;

    const savePrevPosition = (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    ) => {
        firstMousePosition.current = { x: e.clientX, y: e.clientY };
        prevCropArea.current = cropArea;
    };

    const invariantMoving = () =>
        isCropMoving.current ||
        isNWMoving.current ||
        isSEMoving.current ||
        isNEMoving.current ||
        isSWMoving.current;

    const handleCropDown = (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    ) => {
        e.stopPropagation();
        e.preventDefault();
        if (invariantMoving()) return;
        isCropMoving.current = true;
        savePrevPosition(e);
    };

    const handleNWDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();
        e.preventDefault();
        if (invariantMoving()) return;
        isNWMoving.current = true;
        savePrevPosition(e);
    };

    const handleSEDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();
        e.preventDefault();
        if (invariantMoving()) return;
        isSEMoving.current = true;
        savePrevPosition(e);
    };

    const handleNEDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();
        e.preventDefault();
        if (invariantMoving()) return;
        isNEMoving.current = true;
        savePrevPosition(e);
    };

    const handleSWDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();
        e.preventDefault();
        if (invariantMoving()) return;
        isSWMoving.current = true;
        savePrevPosition(e);
    };

    useEffect(() => {
        if (!imgLoaded.current) return;
        onCrop(
            Math.floor((lx / componentWidth.current) * originWidth.current),
            Math.floor((ly / componentHeight.current) * originHeight.current),
            Math.ceil((rx / componentWidth.current) * originWidth.current),
            Math.ceil((ry / componentHeight.current) * originHeight.current),
        );
    }, [cropArea, imageSrc, lx, ly, onCrop, rx, ry]);

    useEffect(() => {
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            if (containerRef.current) {
                imgLoaded.current = true;
                originWidth.current = img.width;
                originHeight.current = img.height;
                containerRef.current.style.height = `${componentHeight.current}px`;
                containerRef.current.style.width = `${(img.width / img.height) * componentHeight.current}px`;
                componentWidth.current =
                    (img.width / img.height) * componentHeight.current;
            }
        };
    }, [imageSrc]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!invariantMoving()) return;
            const x = e.clientX - firstMousePosition.current.x;
            const y = e.clientY - firstMousePosition.current.y;
            let newX1 = prevCropArea.current.x1;
            let newY1 = prevCropArea.current.y1;
            let newX2 = prevCropArea.current.x2;
            let newY2 = prevCropArea.current.y2;

            if (
                isCropMoving.current &&
                !isNWMoving.current &&
                !isSEMoving.current &&
                !isNEMoving.current &&
                !isSWMoving.current
            ) {
                newX1 = limitX(newX1 + x);
                newY1 = limitY(newY1 + y);
                newX2 = limitX(newX2 + x);
                newY2 = limitY(newY2 + y);
            }

            if (
                isNWMoving.current &&
                !isCropMoving.current &&
                !isSEMoving.current &&
                !isNEMoving.current &&
                !isSWMoving.current
            ) {
                newX1 = limitX(newX1 + x);
                newY1 = limitY(newY1 + y);
            }

            if (
                isSEMoving.current &&
                !isCropMoving.current &&
                !isNWMoving.current &&
                !isNEMoving.current &&
                !isSWMoving.current
            ) {
                newX2 = limitX(newX2 + x);
                newY2 = limitY(newY2 + y);
            }

            if (
                isNEMoving.current &&
                !isCropMoving.current &&
                !isNWMoving.current &&
                !isSEMoving.current &&
                !isSWMoving.current
            ) {
                newX2 = limitX(newX2 + x);
                newY1 = limitY(newY1 + y);
            }

            if (
                isSWMoving.current &&
                !isCropMoving.current &&
                !isNWMoving.current &&
                !isSEMoving.current &&
                !isNEMoving.current
            ) {
                newX1 = limitX(newX1 + x);
                newY2 = limitY(newY2 + y);
            }

            setCropArea({
                x1: Math.min(newX1, newX2),
                y1: Math.min(newY1, newY2),
                x2: Math.max(newX1, newX2),
                y2: Math.max(newY1, newY2),
            });
        };

        const handleMouseUp = () => {
            isCropMoving.current = false;
            isNWMoving.current = false;
            isSEMoving.current = false;
            isNEMoving.current = false;
            isSWMoving.current = false;
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    return (
        <div className="h-full">
            <div className="relative" ref={containerRef}>
                <CustomImage
                    className="relative select-none pointer-events-none h-full w-auto"
                    src={imageSrc}
                    adjustHeight
                    adjustWidth={false}
                >
                    <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50"></div>
                    <img
                        src={imageSrc}
                        className="absolute top-0 left-0 w-full h-full"
                        style={{
                            clipPath: `polygon(${lx}px ${ly}px, ${rx}px ${ly}px, ${rx}px ${ry}px, ${lx}px ${ry}px)`,
                        }}
                    ></img>
                </CustomImage>
                <div
                    ref={cropRef}
                    className="absolute cursor-move border-2 border-solid border-cropper"
                    style={{
                        top: `${ly}px`,
                        left: `${lx}px`,
                        width: `${rx - lx}px`,
                        height: `${ry - ly}px`,
                    }}
                    onMouseDown={handleCropDown}
                />
                <div
                    className="absolute cursor-nwse-resize w-4 h-4 rounded-full bg-cropper translate-[calc(-50%+2px)]"
                    style={{
                        top: `${ly}px`,
                        left: `${lx}px`,
                    }}
                    onMouseDown={handleNWDown}
                />
                <div
                    className="absolute cursor-nesw-resize w-4 h-4 rounded-full bg-cropper translate-y-[calc(-50%+2px)] translate-x-[calc(-50%-2px)]"
                    style={{
                        top: `${ly}px`,
                        left: `${rx}px`,
                    }}
                    onMouseDown={handleNEDown}
                />
                <div
                    className="absolute cursor-nesw-resize w-4 h-4 rounded-full bg-cropper translate-y-[calc(-50%-2px)] translate-x-[calc(-50%+2px)]"
                    style={{
                        top: `${ry}px`,
                        left: `${lx}px`,
                    }}
                    onMouseDown={handleSWDown}
                />
                <div
                    className="absolute cursor-nwse-resize w-4 h-4 rounded-full bg-cropper translate-[calc(-50%-2px)]"
                    style={{
                        top: `${ry}px`,
                        left: `${rx}px`,
                    }}
                    onMouseDown={handleSEDown}
                />
            </div>
        </div>
    );
};

export default Cropper;
