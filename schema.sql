-- Creator profiles (scraped data)
CREATE TABLE IF NOT EXISTS creators (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    bio TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    subscription_price DECIMAL(10,2) DEFAULT 0,
    is_free BOOLEAN DEFAULT false,
    post_count INTEGER DEFAULT 0,
    media_count INTEGER DEFAULT 0,
    photo_count INTEGER DEFAULT 0,
    video_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    subscriber_count INTEGER DEFAULT 0,
    location VARCHAR(255),
    country VARCHAR(100),
    city VARCHAR(100),
    last_scraped_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tags/categories
CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    creator_count INTEGER DEFAULT 0
);

-- Many-to-many: creators <-> tags
CREATE TABLE IF NOT EXISTS creator_tags (
    creator_id INTEGER REFERENCES creators(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (creator_id, tag_id)
);

-- Click tracking (for future CPC)
CREATE TABLE IF NOT EXISTS clicks (
    id SERIAL PRIMARY KEY,
    creator_id INTEGER REFERENCES creators(id) ON DELETE CASCADE,
    clicked_at TIMESTAMP DEFAULT NOW(),
    ip_hash VARCHAR(64),
    source VARCHAR(50)
);

-- Indexes
CREATE INDEX idx_creators_username ON creators(username);
CREATE INDEX idx_creators_is_free ON creators(is_free);
CREATE INDEX idx_creators_subscriber_count ON creators(subscriber_count DESC);
CREATE INDEX idx_creators_country ON creators(country);
CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_creator_tags_creator ON creator_tags(creator_id);
CREATE INDEX idx_creator_tags_tag ON creator_tags(tag_id);
CREATE INDEX idx_clicks_creator ON clicks(creator_id);
CREATE INDEX idx_clicks_date ON clicks(clicked_at);

-- Seed initial tags
INSERT INTO tags (name, slug) VALUES
    ('Free', 'free'),
    ('Blonde', 'blonde'),
    ('Brunette', 'brunette'),
    ('Redhead', 'redhead'),
    ('Asian', 'asian'),
    ('Latina', 'latina'),
    ('Ebony', 'ebony'),
    ('MILF', 'milf'),
    ('Teen', 'teen'),
    ('Big Boobs', 'big-boobs'),
    ('Big Ass', 'big-ass'),
    ('Petite', 'petite'),
    ('Curvy', 'curvy'),
    ('Tattoos', 'tattoos'),
    ('Goth', 'goth'),
    ('Cosplay', 'cosplay'),
    ('Feet', 'feet'),
    ('GFE', 'gfe'),
    ('Trans', 'trans'),
    ('Couple', 'couple'),
    ('Fitness', 'fitness'),
    ('Lingerie', 'lingerie'),
    ('New', 'new'),
    ('Popular', 'popular'),
    ('Threesome', 'threesome')
ON CONFLICT (slug) DO NOTHING;
