"use client";

import { useState } from "react";
import Link from "next/link";

interface QuizResult {
    categories: string[];
    priceRange: string;
    contentType: string;
}

const QUESTIONS = [
    {
        id: "vibe",
        question: "What vibe are you looking for?",
        options: [
            { label: "Girl next door", value: "new", emoji: "🏡" },
            { label: "Alternative / edgy", value: "goth", emoji: "🖤" },
            { label: "Fitness / athletic", value: "fitness", emoji: "💪" },
            { label: "Glamorous / model", value: "lingerie", emoji: "✨" },
            { label: "Cosplay / fantasy", value: "cosplay", emoji: "🎭" },
            { label: "No preference", value: "any", emoji: "🤷" },
        ],
    },
    {
        id: "bodyType",
        question: "Body type preference?",
        options: [
            { label: "Petite / slim", value: "petite", emoji: "🦋" },
            { label: "Curvy / thick", value: "curvy", emoji: "🍑" },
            { label: "Athletic / toned", value: "fitness", emoji: "🏋️" },
            { label: "BBW / plus size", value: "big-boobs", emoji: "💖" },
            { label: "No preference", value: "any", emoji: "🤷" },
        ],
    },
    {
        id: "appearance",
        question: "Hair / ethnicity preference?",
        options: [
            { label: "Blonde", value: "blonde", emoji: "👱" },
            { label: "Brunette", value: "brunette", emoji: "👩" },
            { label: "Redhead", value: "redhead", emoji: "🧑‍🦰" },
            { label: "Latina", value: "latina", emoji: "🌶️" },
            { label: "Asian", value: "asian", emoji: "🌸" },
            { label: "Ebony", value: "ebony", emoji: "👑" },
            { label: "No preference", value: "any", emoji: "🤷" },
        ],
    },
    {
        id: "budget",
        question: "What's your budget?",
        options: [
            { label: "Free only", value: "free", emoji: "🆓" },
            { label: "Under $10/mo", value: "cheap", emoji: "💵" },
            { label: "Under $20/mo", value: "mid", emoji: "💰" },
            { label: "Don't care about price", value: "any", emoji: "💎" },
        ],
    },
    {
        id: "content",
        question: "What content matters most?",
        options: [
            { label: "Lots of photos", value: "photos", emoji: "📸" },
            { label: "Lots of videos", value: "videos", emoji: "🎬" },
            { label: "Active poster (daily+)", value: "active", emoji: "📅" },
            { label: "Huge back catalog", value: "catalog", emoji: "📚" },
            { label: "Doesn't matter", value: "any", emoji: "🤷" },
        ],
    },
];

export default function QuizClient() {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [results, setResults] = useState<QuizResult | null>(null);

    const handleAnswer = (questionId: string, value: string) => {
        const newAnswers = { ...answers, [questionId]: value };
        setAnswers(newAnswers);

        if (step < QUESTIONS.length - 1) {
            setStep(step + 1);
        } else {
            // Calculate results
            const categories: string[] = [];
            if (newAnswers.vibe && newAnswers.vibe !== "any") categories.push(newAnswers.vibe);
            if (newAnswers.bodyType && newAnswers.bodyType !== "any") categories.push(newAnswers.bodyType);
            if (newAnswers.appearance && newAnswers.appearance !== "any") categories.push(newAnswers.appearance);

            // Default fallback
            if (categories.length === 0) categories.push("popular");

            setResults({
                categories,
                priceRange: newAnswers.budget || "any",
                contentType: newAnswers.content || "any",
            });
        }
    };

    const reset = () => {
        setStep(0);
        setAnswers({});
        setResults(null);
    };

    if (results) {
        const primary = results.categories[0] || "free";
        const secondary = results.categories[1];

        return (
            <div className="quiz-results">
                <h2 className="quiz-results-title">Your Perfect Match</h2>
                <p className="quiz-results-sub">Based on your answers, here are the best categories for you:</p>

                <div className="quiz-results-cats">
                    <Link href={`/onlyfans/${primary}`} className="quiz-result-card quiz-result-primary">
                        <span className="quiz-result-label">Best Match</span>
                        <span className="quiz-result-cat">{primary.replace(/-/g, " ")}</span>
                        <span className="quiz-result-action">Browse →</span>
                    </Link>
                    {secondary && (
                        <Link href={`/onlyfans/${secondary}`} className="quiz-result-card">
                            <span className="quiz-result-label">Also Try</span>
                            <span className="quiz-result-cat">{secondary.replace(/-/g, " ")}</span>
                            <span className="quiz-result-action">Browse →</span>
                        </Link>
                    )}
                    {results.priceRange === "free" && (
                        <Link href="/onlyfans/free" className="quiz-result-card">
                            <span className="quiz-result-label">Budget Pick</span>
                            <span className="quiz-result-cat">Free Accounts</span>
                            <span className="quiz-result-action">Browse →</span>
                        </Link>
                    )}
                </div>

                <div className="quiz-tips">
                    <h3>Tips based on your preferences:</h3>
                    <ul>
                        {results.priceRange === "free" && <li>Filter for free accounts — many top creators offer free subscriptions with paid PPV content</li>}
                        {results.priceRange === "cheap" && <li>Look for creators under $10/mo — they often have the best content-to-price ratio</li>}
                        {results.contentType === "photos" && <li>Check the media count — creators with 500+ posts tend to be photo-heavy</li>}
                        {results.contentType === "videos" && <li>Look for high video counts — the best video creators post 100+ clips</li>}
                        {results.contentType === "active" && <li>Sort by newest content — active creators post daily and reply to DMs</li>}
                        {results.contentType === "catalog" && <li>Look for creators with 1000+ media posts — instant access to a massive library</li>}
                        <li>Always check the like count — higher likes = more satisfied subscribers</li>
                    </ul>
                </div>

                <button onClick={reset} className="quiz-reset">Take Quiz Again</button>
            </div>
        );
    }

    const current = QUESTIONS[step];

    return (
        <div className="quiz-container">
            <div className="quiz-progress">
                <div className="quiz-progress-bar" style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} />
            </div>
            <p className="quiz-step">Question {step + 1} of {QUESTIONS.length}</p>
            <h2 className="quiz-question">{current.question}</h2>
            <div className="quiz-options">
                {current.options.map((opt) => (
                    <button
                        key={opt.value}
                        className="quiz-option"
                        onClick={() => handleAnswer(current.id, opt.value)}
                    >
                        <span className="quiz-option-emoji">{opt.emoji}</span>
                        <span className="quiz-option-label">{opt.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
