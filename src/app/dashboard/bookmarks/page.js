// app/dashboard/bookmarks/page.js
import BookMarksClient from "@/components/dashboard/BookMarksClient";
import BookmarkButton from "@/components/engagement/BookmarkButton";
export const metadata = {
  title: "Bookmarks | AI Knowledge Hub",
};

export default function BookmarksPage() {
  return (
    <div>
      <BookmarkButton />
      <BookMarksClient />
    </div>
  );
}
