import { useState, useCallback } from "react";

// Generic async action hook
export const useAsync = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const run = useCallback(async (fn) => {
        setLoading(true);
        setError(null);
        try {
            const result = await fn();
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { loading, error, run };
};

// Decode JWT payload
export const getUserIdFromToken = (token) => {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.id;
    } catch {
        return null;
    }
};

// Format proof score color
export const getScoreColor = (score) => {
    if (score >= 75) return "#16a34a";
    if (score >= 50) return "#f59e0b";
    return "#dc2626";
};

// Format trust rank badge styles
export const getTrustRankStyle = (rank) => {
    switch (rank) {
        case "Elite": return { bg: "#fef3c7", color: "#92400e", border: "#f59e0b" };
        case "Verified": return { bg: "#dcfce7", color: "#166534", border: "#16a34a" };
        case "Rising": return { bg: "#dbeafe", color: "#1e40af", border: "#3b82f6" };
        default: return { bg: "#f3f4f6", color: "#6b7280", border: "#d1d5db" };
    }
};

// Format relative date
export const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
};

export const getVideoThumbnail = (url) => {
    if (!url) return "";
    return url.replace("/video/upload/", "/video/upload/so_0,f_jpg/");
};