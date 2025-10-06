"use client";

import { useState } from "react";

export default function PostContent({ content }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  if (!content) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No content available for this post.</p>
      </div>
    );
  }

  const handleSummarize = async () => {
    try {
      setLoading(true);
      setSummary(null);

      const res = await fetch("/api/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "summarize",
          content: content,
        }),
      });

      const data = await res.json();
      const newSummary = data.suggestion || "Could not generate summary.";
      setSummary(newSummary);
      setShowSummary(true);
    } catch (error) {
      console.error("Summarize error:", error);
      setSummary("Error summarizing the content.");
      setShowSummary(true);
    } finally {
      setLoading(false);
    }
  };

  const closeSummary = () => {
    setShowSummary(false);
  };

  const regenerateSummary = () => {
    handleSummarize();
  };

  return (
    <article className="prose prose-lg max-w-none mx-auto">
      {/* Header with Summary Button - More Prominent AI Suggestion */}
      <div className="flex justify-between items-start mb-6 not-prose">
        <div className="flex-1"></div>
        <div className="bg-gradient-to-r from-gray-800 to-black p-0.5 rounded-lg shadow-lg">
          <button
            onClick={handleSummarize}
            disabled={loading}
            className="px-6 py-3 bg-white rounded-md hover:bg-gray-50 disabled:bg-gray-100 transition-colors font-semibold text-gray-800 flex items-center gap-3 group"
          >
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-gray-700 to-black rounded-full">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent">
              {loading ? "Generating AI Summary..." : "✨ Get AI Summary"}
            </span>
            {loading && (
              <div className="animate-spin w-4 h-4 border-2 border-gray-200 border-t-gray-800 rounded-full"></div>
            )}
          </button>
        </div>
      </div>

      {/* Alternative Option 2: Floating Action Button (uncomment to use) */}
      {/*
      <div className="fixed top-24 right-6 z-10 not-prose">
        <button
          onClick={handleSummarize}
          disabled={loading}
          className="w-12 h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-gray-400 transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
          title={loading ? "Summarizing..." : "Get AI Summary"}
        >
          {loading ? (
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
        </button>
      </div>
      */}

      {/* Alternative Option 3: Sticky Top Bar (uncomment to use) */}
      {/*
      <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-gray-200 p-3 mb-6 not-prose z-10">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-600">Quick Actions</h3>
          <button
            onClick={handleSummarize}
            disabled={loading}
            className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-gray-400 transition-colors text-xs font-medium"
          >
            {loading ? "..." : "📝 Summarize"}
          </button>
        </div>
      </div>
      */}

      {/* Enhanced Summary Display with Close and Regenerate */}
      {summary && showSummary && (
        <div className="mb-6 relative not-prose">
          {/* Prominent AI Badge */}
          <div className="absolute -top-3 left-4 z-10">
            <div className="bg-gradient-to-r from-gray-800 to-black text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI POWERED SUMMARY
            </div>
          </div>
          
          {/* Close Button */}
          <button
            onClick={closeSummary}
            className="absolute -top-2 -right-2 z-10 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors flex items-center justify-center group"
            title="Close Summary"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Summary Content */}
          <div className="bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 border-2 border-gray-300 rounded-xl p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-gray-700 to-black rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">📝 Easy Summary</h3>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed text-base">{summary}</p>
                
                {/* Action Buttons */}
                <div className="flex gap-3 mt-4 pt-4 border-t border-gray-300">
                  <button
                    onClick={regenerateSummary}
                    disabled={loading}
                    className="px-4 py-2 bg-gradient-to-r from-gray-700 to-black text-white rounded-lg hover:from-gray-800 hover:to-gray-900 disabled:opacity-50 transition-all font-medium text-sm flex items-center gap-2 shadow-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {loading ? "Regenerating..." : "Regenerate"}
                  </button>
                  
                  <button
                    onClick={() => navigator.share ? navigator.share({title: 'AI Summary', text: summary}) : navigator.clipboard.writeText(summary)}
                    className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm flex items-center gap-2 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className="prose prose-slate max-w-none prose-a:text-primary hover:prose-a:underline prose-code:bg-muted prose-pre:bg-muted"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </article>
  );
}