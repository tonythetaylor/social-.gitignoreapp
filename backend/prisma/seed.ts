import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create mock users
  const users = await Promise.all(
    Array.from({ length: 5 }).map(async (_, index) => {
      const hashedPassword = await bcrypt.hash(`password${index + 1}`, 10); // Hash passwords for each user

      const user = await prisma.user.create({
        data: {
          email: `user${index + 1}@example.com`,
          password: hashedPassword,
          username: `user${index + 1}`,
          bio: `This is user number ${index + 1}. A bio for testing.`,
          website: `https://user${index + 1}.com`,
          profilePicture: `https://via.placeholder.com/150?text=User+${index + 1}`,
        },
      });
      return user;
    })
  );

  console.log('Seeded users:', users);

  // Create multiple posts for each user
  await Promise.all(
    users.map(async (user) => {
      const posts = Array.from({ length: 3 }).map((_, postIndex) => {
        return prisma.post.create({
          data: {
            content: `This is post ${postIndex + 1} from ${user.username}.`,
            userId: user.id,
            imageUrl: `https://via.placeholder.com/600x400?text=Post+${postIndex + 1}+by+${user.username}`,
          },
        });
      });

      // Wait for all posts to be created for the user
      await Promise.all(posts);
    })
  );

  console.log('Seeded multiple posts for each user.');
}

// Run the seed function and handle errors
main()
  .catch(e => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });