"use client";

export default function CreatorCardLink({
    href,
    creatorId,
    source,
    className,
    children,
    external = false,
}: {
    href: string;
    creatorId: number;
    source: string;
    className?: string;
    children: React.ReactNode;
    external?: boolean;
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
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className={className}
            onClick={handleClick}
        >
            {children}
        </a>
    );
}
