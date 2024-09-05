import { PrismaClient } from "@prisma/client";
import { Role, Group } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      role: Role.ADMIN,
      group: Group.DAY,
    },
  });

  // Create guests
  const numberOfGuests = 200;
  for (let i = 0; i < numberOfGuests; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const name = `${firstName} ${lastName}`;
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    await prisma.user.upsert({
      where: { email: email },
      update: {},
      create: {
        email: email,
        name: name,
        role: Role.GUEST,
        group: faker.helpers.arrayElement([Group.EVENING, Group.DAY]),
      },
    });
  }

  // Create some content
  await prisma.content.upsert({
    where: { slug: "home" },
    update: {},
    create: {
      slug: "home",
      html: "<h1>Welcome to our wedding website!</h1>",
      updatedByUserId: adminUser.id,
    },
  });

  // Create RSVPs for some guests
  const allGuests = await prisma.user.findMany({
    where: { role: Role.GUEST },
  });

  for (const guest of allGuests) {
    if (faker.datatype.boolean(0.8)) {
      // Randomly decide whether to create RSVP
      await prisma.rsvp.upsert({
        where: { userId: guest.id },
        update: {},
        create: {
          userId: guest.id,
          isAttending: faker.datatype.boolean(0.75),
          dietaryRequirements: faker.datatype.boolean(0.25)
            ? faker.helpers.arrayElement([
                "None",
                "Vegetarian",
                "Vegan",
                "Gluten-free",
                "Nut allergy",
              ])
            : "",
          extraInfo: faker.datatype.boolean(0.25) ? faker.lorem.sentence() : "",
        },
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect().catch((e) => {
      console.error(e);
    });
  });