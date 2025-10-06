// components/ui/Avatar.jsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * Reusable Avatar component with proper error handling and fallbacks
 * 
 * @param {Object} props
 * @param {string} props.src - Avatar image URL
 * @param {string} props.alt - Alt text for the image
 * @param {number} props.size - Size in pixels (default: 40)
 * @param {string} props.fallbackText - Text to show when image fails (default: first letter of alt)
 * @param {string} props.userId - User ID for linking to profile (optional)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showOnlineIndicator - Show online indicator (default: false)
 * @param {Function} props.onClick - Click handler (optional)
 */
export default function Avatar({
  src,
  alt = "User",
  size = 40,
  fallbackText,
  userId,
  className = "",
  showOnlineIndicator = false,
  onClick
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const getFallbackText = () => {
    if (fallbackText) return fallbackText;
    return alt.charAt(0).toUpperCase();
  };

  const avatarContent = (
    <div 
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {!imageError && src ? (
        <>
          <Image
            src={src}
            alt={alt}
            width={size}
            height={size}
            className={`rounded-full object-cover transition-opacity duration-200 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
          {/* Loading placeholder */}
          {imageLoading && (
            <div 
              className="absolute inset-0 bg-gray-200 animate-pulse rounded-full flex items-center justify-center"
            >
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </>
      ) : (
        /* Fallback avatar with initials */
        <div 
          className="rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-semibold shadow-sm"
          style={{
            fontSize: size * 0.4,
            width: size,
            height: size
          }}
        >
          {getFallbackText()}
        </div>
      )}

      {/* Online indicator */}
      {showOnlineIndicator && (
        <div 
          className="absolute -bottom-0.5 -right-0.5 bg-green-500 rounded-full border-2 border-white"
          style={{
            width: size * 0.25,
            height: size * 0.25
          }}
        >
          <div className="w-full h-full bg-white rounded-full scale-50"></div>
        </div>
      )}
    </div>
  );

  // If userId is provided and no custom onClick, make it a link to profile
  if (userId && !onClick) {
    return (
      <Link
        href={`/profile/${userId}`}
        className="hover:opacity-80 transition-opacity"
        title={`View ${alt}'s profile`}
      >
        {avatarContent}
      </Link>
    );
  }

  // If onClick handler is provided, make it clickable
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full"
        title={alt}
      >
        {avatarContent}
      </button>
    );
  }

  return avatarContent;
}

// Export some common size presets
export const AvatarSizes = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  xxl: 96,
  profile: 120
};