// lib/userInteractions.js
export async function getUserInteractions(postId, userId) {
  if (!userId) {
    return {
      hasLiked: false,
      isFollowing: false
    };
  }

  try {
    // Check if user liked the post
    const [likesRes, followsRes] = await Promise.all([
      fetch(`/api/reactions?targetType=post&targetId=${postId}`),
      fetch('/api/follow')
    ]);

    const likesData = await likesRes.json();
    const followsData = await followsRes.json();

    return {
      hasLiked: likesData.userReaction === 'like',
      isFollowing: followsData.includes(userId)
    };
  } catch (error) {
    console.error('Error fetching user interactions:', error);
    return {
      hasLiked: false,
      isFollowing: false
    };
  }
}