interface Creator {
  id: number;
  username: string;
  display_name: string;
  avatar_url: string;
  subscription_price: number;
  is_free: boolean;
  post_count: number;
  media_count: number;
  like_count: number;
  subscriber_count: number;
}

export default function CreatorCard({ creator }: { creator: Record<string, unknown> }) {
  const c = creator as unknown as Creator;

  return (
    <a
      href={`https://onlyfans.com/${c.username}`}
      target="_blank"
      rel="noopener noreferrer"
      className="creator-card"
    >
      <div className="creator-card-img">
        {c.avatar_url ? (
          <img
            src={c.avatar_url}
            alt={c.display_name || c.username}
          />
        ) : (
          <div className="placeholder-avatar">?</div>
        )}
        <span className={`price-badge${c.is_free ? " price-free" : ""}`}>
          {c.is_free ? "FREE" : `$${c.subscription_price}/mo`}
        </span>
      </div>

      <div className="creator-card-info">
        <h3>{c.display_name || c.username}</h3>
        <p className="username">@{c.username}</p>
        <div className="creator-card-stats">
          <span>📸 {c.media_count?.toLocaleString()}</span>
          <span>❤️ {c.like_count?.toLocaleString()}</span>
        </div>
      </div>
    </a>
  );
}
