// components/profile/UserCard.jsx
"use client";

import Image from "next/image";
import FollowButton from "@/components/engagement/FollowButton";

export default function UserCard({ user }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-4 mb-4">
        <Image
          src={user.image || "/images/placeholder.jpg"}
          alt={user.name}
          width={48}
          height={48}
          className="rounded-full border-2 border-gray-100"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
          <p className="text-sm text-gray-500 truncate">{user.email}</p>
        </div>
      </div>
      
      {user.bio && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{user.bio}</p>
      )}
      
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {user.postsCount || 0} posts
        </div>
        <FollowButton authorId={user.providerId || user.id} />
      </div>
    </div>
  );
}