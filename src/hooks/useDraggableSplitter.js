// src/hooks/useDraggableSplitter.js

import { useState, useEffect, useRef, useCallback } from 'react'; // Added useCallback

export function useDraggableSplitter(containerRef, initialSplitPos, orientation, onDrag) {
    const [splitPos, setSplitPos] = useState(initialSplitPos);
    const [isDragging, setIsDragging] = useState(false);
    const animationFrameId = useRef(null);

    // Define onMouseMove and onMouseUp as useCallback to ensure stable references
    const onMouseMove = useCallback((e) => {
        if (!containerRef.current || !isDragging) return;

        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = requestAnimationFrame(() => {
            const { left, top, width, height } = containerRef.current.getBoundingClientRect();
            let newPos;
            if (orientation === 'vertical') {
                // Ensure newPos stays within 20% and 80% bounds
                newPos = Math.max(20, Math.min(80, ((e.clientX - left) / width) * 100));
            } else {
                newPos = Math.max(20, Math.min(80, ((e.clientY - top) / height) * 100));
            }
            setSplitPos(newPos);
            if (onDrag) onDrag(newPos); // Call the onDrag callback if provided
        });
    }, [containerRef, isDragging, orientation, onDrag]); // Dependencies for useCallback

    const onMouseUp = useCallback(() => {
        setIsDragging(false);
        // Remove global event listeners after drag ends
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    }, [onMouseMove]); // Dependency for useCallback

    // The handler that starts the drag operation, now returned from the hook
    const handleMouseDown = useCallback((e) => {
        e.preventDefault(); // Prevent default browser drag behavior
        setIsDragging(true);
        // Add global event listeners when drag starts
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }, [onMouseMove, onMouseUp]); // Dependencies for useCallback

    // Cleanup effect for when the component unmounts or dependencies change
    useEffect(() => {
        return () => {
            // Ensure listeners are removed to prevent memory leaks
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        };
    }, [onMouseMove, onMouseUp]); // Dependencies for cleanup

    // Return the state and handler that the component needs
    return { splitPos, isDragging, handleMouseDown };
}