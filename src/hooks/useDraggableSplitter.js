// src/hooks/useDraggableSplitter.js

import { useState, useEffect, useRef, useCallback } from 'react'; // Added useCallback

export function useDraggableSplitter(containerRef, initialSplitPos, orientation) {
    const [splitPos, setSplitPos] = useState(initialSplitPos);

    useEffect(() => {
        setSplitPos(initialSplitPos);
    }, [initialSplitPos]);
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging || !containerRef.current) return;
            e.preventDefault();

            const { left, top, width, height } = containerRef.current.getBoundingClientRect();
            let newPos;

            if (orientation === 'vertical') {
                newPos = ((e.clientX - left) / width) * 100;
            } else {
                newPos = ((e.clientY - top) / height) * 100;
            }
            
            setSplitPos(Math.max(10, Math.min(90, newPos)));
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.body.style.cursor = orientation === 'vertical' ? 'col-resize' : 'row-resize';
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            document.body.style.cursor = '';
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
        };
    }, [isDragging, containerRef, orientation]);

    return { splitPos, isDragging, handleMouseDown };
}