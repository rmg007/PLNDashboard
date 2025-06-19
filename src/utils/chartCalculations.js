// src/utils/chartCalculations.js

export const calculateLinearRegression = (data, xAccessor, yAccessor) => {
    const n = data.length;
    if (n < 2) return [];
    const numericData = data.filter(d => typeof d[xAccessor] === 'number' && typeof d[yAccessor] === 'number' && !isNaN(d[xAccessor]) && !isNaN(d[yAccessor]));
    if (numericData.length < 2) return [];
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    numericData.forEach(d => {
        const x = d[xAccessor];
        const y = d[yAccessor];
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumXX += x * x;
    });
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    const minX = Math.min(...numericData.map(d => d[xAccessor]));
    const maxX = Math.max(...numericData.map(d => d[xAccessor]));
    return [{ x: minX, y: slope * minX + intercept }, { x: maxX, y: slope * maxX + intercept }];
};

export const calculateAverage = (data, yAccessor) => {
    if (!data || data.length === 0) return 0;
    const numericData = data.filter(d => typeof d[yAccessor] === 'number' && !isNaN(d[yAccessor]));
    if (numericData.length === 0) return 0;
    const sum = numericData.reduce((acc, d) => acc + d[yAccessor], 0);
    return sum / numericData.length;
};