export function SkeletonCard() {
    return (
        <div className="project-card">
            <div className="skeleton" style={{ height: 170 }} />
            <div className="project-body">
                <div className="skeleton" style={{ height: 14, marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 14, width: "70%", marginBottom: 16 }} />
                <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                    <div className="skeleton" style={{ height: 22, width: 60, borderRadius: 99 }} />
                    <div className="skeleton" style={{ height: 22, width: 70, borderRadius: 99 }} />
                </div>
                <div className="skeleton" style={{ height: 6, borderRadius: 99 }} />
            </div>
        </div>
    );
}

export function SkeletonStat() {
    return (
        <div className="stat-card">
            <div className="skeleton" style={{ height: 38, width: 38, borderRadius: 10, marginBottom: 14 }} />
            <div className="skeleton" style={{ height: 28, width: "60%", marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 14, width: "80%" }} />
        </div>
    );
}