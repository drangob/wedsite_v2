import { type Layout, PrismaClient } from "@prisma/client";
import { Role, Group } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  await prisma.user.upsert({
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
    const email = faker.internet
      .email({ firstName, lastName, provider: "example.com" })
      .toLowerCase();

    await prisma.user.upsert({
      where: { id: `guest${i}` },
      update: {},
      create: {
        id: `guest${i}`,
        email: email,
        name: name,
        role: Role.GUEST,
        group: faker.helpers.arrayElement([Group.EVENING, Group.DAY]),
        guestNames: [name, `${firstName}'s plus one`],
      },
    });
  }

  // Create some content
  const home = await prisma.content.upsert({
    where: { slug: "home" },
    update: {},
    create: {
      slug: "home",
      title: "Home",
      protected: true,
    },
  });

  await prisma.contentPiece.upsert({
    where: {
      id: `${home.id}-0`,
    },
    update: {},
    create: {
      id: `${home.id}-0`,
      html: "<h1>Welcome to our wedding website</h1>",
      order: 0,
      layout: "TEXT",
      content: { connect: { slug: "home" } },
    },
  });

  const rsvp = await prisma.content.upsert({
    where: { slug: "rsvp" },
    update: {},
    create: {
      slug: "rsvp",
      title: "RSVP",
      protected: true,
    },
  });

  await prisma.contentPiece.upsert({
    where: {
      id: `${rsvp.id}-0`,
    },
    update: {},
    create: {
      id: `${rsvp.id}-0`,
      html: "<h1>RSVP</h1>",
      order: 0,
      layout: "TEXT",
      content: { connect: { slug: "rsvp" } },
    },
  });

  const music = await prisma.content.upsert({
    where: { slug: "music" },
    update: {},
    create: {
      slug: "music",
      title: "Music",
      protected: true,
    },
  });

  await prisma.contentPiece.upsert({
    where: {
      id: `${music.id}-0`,
    },
    update: {},
    create: {
      id: `${music.id}-0`,
      html: "<h1>Music</h1>",
      order: 0,
      layout: "TEXT",
      content: { connect: { slug: "music" } },
    },
  });

  const contact = await prisma.content.upsert({
    where: { slug: "contact" },
    update: {},
    create: {
      slug: "contact",
      title: "Contact Us",
      protected: false,
    },
  });

  const layouts: Layout[] = ["TEXT", "IMAGE_FIRST", "IMAGE_LAST"];
  for (const [index, layout] of layouts.entries()) {
    await prisma.contentPiece.upsert({
      where: {
        id: `${contact.id}-${index}`,
      },
      update: {},
      create: {
        id: `${contact.id}-${index}`,
        html: faker.lorem.paragraph(),
        order: index,
        layout: layout,
        content: { connect: { slug: "contact" } },
      },
    });
  }

  // Create RSVPs for some guests
  const allGuests = await prisma.user.findMany({
    where: { role: Role.GUEST },
  });

  for (const guest of allGuests) {
    if (faker.datatype.boolean(0.8)) {
      // Randomly decide whether to create RSVP
      const shuffledGuestNames = faker.helpers.shuffle(guest.guestNames);
      const attendingCount = faker.number.int({
        min: 0,
        max: shuffledGuestNames.length,
      });
      const attendingGuestNames = shuffledGuestNames.slice(0, attendingCount);
      const nonAttendingGuestNames = shuffledGuestNames.slice(attendingCount);

      await prisma.rsvp.upsert({
        where: { userId: guest.id },
        update: {
          attendingGuestNames: attendingGuestNames,
          nonAttendingGuestNames: nonAttendingGuestNames,
        },
        create: {
          userId: guest.id,
          attendingGuestNames: attendingGuestNames,
          nonAttendingGuestNames: nonAttendingGuestNames,
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
    } else {
      await prisma.rsvp.deleteMany({
        where: { userId: guest.id },
      });
    }
  }

  // Create some emails
  for (let i = 0; i < 10; i++) {
    // get a random selection of the mock users
    const users = await prisma.user.findMany({
      take: 25,
      skip: faker.number.int({ min: 0, max: numberOfGuests - 5 }),
    });
    await prisma.email.upsert({
      where: { id: i.toString() },
      update: {},
      create: {
        id: i.toString(),
        from: process.env.EMAIL_RESEND_SENDER!,
        subject: faker.lorem.sentence(),
        body: faker.lorem.paragraph(),
        sentAt: faker.date.recent(),
        createdAt: faker.date.recent(),
        updatedAt: faker.date.recent(),
        to: {
          connect: users.map((user) => ({ id: user.id })),
        },
      },
    });
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
