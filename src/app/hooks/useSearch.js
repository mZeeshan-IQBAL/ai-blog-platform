"use client";
import { useState, useEffect, useCallback } from "react";

export default function useSearch(initialQuery = "") {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const safeJson = async (res) => {
    try {
      return await res.json();
    } catch {
      return [];
    }
  };

  const searchPosts = useCallback(async (searchQuery) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`,
        { cache: "no-store" }
      );
      if (!response.ok) throw new Error("Search failed");

      const data = await safeJson(response);
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to search. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      searchPosts(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchPosts]);

  return { query, setQuery, results, loading, error };
}
