import { db } from '@scilent-one/db';

export async function deleteMentionsByPost(postId: string): Promise<void> {
  await db.mention.deleteMany({
    where: { postId },
  });
}

export async function deleteMentionsByComment(commentId: string): Promise<void> {
  await db.mention.deleteMany({
    where: { commentId },
  });
}
