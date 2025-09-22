// lib/validation.js
import { z } from "zod";

export const PostCreateSchema = z.object({
  title: z.string().min(3).max(160),
  content: z.string().min(20),
});

export const CommentCreateSchema = z.object({
  content: z.string().min(1).max(2000),
  postId: z.string().min(1),
  parentComment: z.string().min(1).optional(),
});
