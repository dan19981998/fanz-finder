"use client";

export default function CreatorCardLink({
    href,
    creatorId,
    source,
    className,
    children,
}: {
    href: string;
    creatorId: number;
    source: string;
    className?: string;
    children: React.ReactNode;
}) {
    const handleClick = () => {
        // Fire-and-forget beacon
        navigator.sendBeacon(
            "/api/click",
            JSON.stringify({ creator_id: creatorId, source })
        );
    };

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
            onClick={handleClick}
        >
            {children}
        </a>
    );
}
