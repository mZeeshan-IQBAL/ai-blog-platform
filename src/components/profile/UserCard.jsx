// components/profile/UserCard.jsx
"use client";

import FollowButton from "@/components/engagement/FollowButton";
import Link from "next/link";
import Avatar, { AvatarSizes } from "@/components/ui/Avatar";

export default function UserCard({ user }) {
  return (
    <div className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-4 mb-4">
        <Avatar
          src={user.image}
          alt={user.name}
          size={AvatarSizes.lg}
          userId={user.id || user._id}
          className="border-2 border-background"
        />
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${user.id || user._id}`} className="font-semibold truncate hover:text-primary transition-colors" title="View Profile">
            {user.name}
          </Link>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
        </div>
      </div>
      
      {user.bio && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{user.bio}</p>
      )}
      
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {user.postsCount ?? 0} posts
        </div>
        <FollowButton authorId={user.id || user._id} />
      </div>
    </div>
  );
}