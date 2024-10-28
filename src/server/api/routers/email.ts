import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { Resend } from "resend";

import { prepareEmailBody } from "@/utils/email";

import nodemailer from "nodemailer";

const resend: Resend = new Resend(process.env.EMAIL_RESEND_API_KEY);

const smtp = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_HOST,
  port: parseInt(process.env.EMAIL_SMTP_PORT ?? "587"),
  secure: true,
  auth: {
    user: process.env.EMAIL_SMTP_USER,
    pass: process.env.EMAIL_SMTP_PASS,
  },
});

const EmailSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.array(z.string()),
  subject: z.string(),
  body: z.string(),
  sent: z.boolean(),
  sentAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const emailRouter = createTRPCRouter({
  getAllEmails: adminProcedure.query(async () => {
    return EmailSchema.array().parseAsync(
      await db.email
        .findMany({
          select: {
            id: true,
            from: true,
            to: true,
            subject: true,
            body: true,
            sentAt: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: "desc" },
        })
        .then((emails) =>
          emails.map((email) => ({
            ...email,
            to: email.to.map((to) => to.email),
            sent: email.sentAt !== null,
          })),
        ),
    );
  }),
  createEmail: adminProcedure.mutation(async () => {
    const a = await db.email.create({
      data: {
        from:
          process.env.EMAIL === "smtp"
            ? process.env.EMAIL_SMTP_SENDER!
            : process.env.EMAIL_RESEND_SENDER!,
        subject: "New email",
        body: "",
        to: {
          connect: [],
        },
      },
    });
    return a;
  }),
  deleteEmail: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.email.delete({
        where: {
          id: input.id,
        },
      });
      return { success: true };
    }),
  updateEmail: adminProcedure
    .input(
      z.object({
        id: z.string(),
        subject: z.string(),
        body: z.string(),
        to: z.array(z.string()),
      }),
    )
    .mutation(async ({ input }) => {
      await db.$transaction(async (prisma) => {
        // Remove all 'to' connections
        await prisma.email.update({
          where: {
            id: input.id,
          },
          data: {
            to: {
              set: [], // This will remove all connections
            },
          },
        });

        // Update with new 'to' connections
        await prisma.email.update({
          where: {
            id: input.id,
          },
          data: {
            to: {
              connect: input.to.map((email) => ({ email: email })),
            },
            subject: input.subject,
            body: input.body,
          },
        });
      });

      return { success: true };
    }),

  sendEmail: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      // Fetch all guest emails
      const email = await db.email.findUnique({
        where: {
          id: input.id,
        },
        select: {
          to: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          subject: true,
          body: true,
        },
      });

      if (!email) {
        throw new Error("Email not found");
      }

      if (email.to.length === 0) {
        throw new Error("No guest emails found");
      }

      const sentEmails = [];
      try {
        // send an email per guest
        for (const recipient of email.to) {
          if (!recipient.email || !recipient.name) {
            continue;
          }
          // Prepare email data
          const emailBody = prepareEmailBody(email.body, {
            name: recipient.name,
            websiteUrl: `${process.env.NEXT_PUBLIC_WEBSITE_URL ?? "https://example.com"}?uid=${recipient.id}`,
            uid: recipient.id,
          });
          const emailData = {
            from: "",
            to: recipient.email,
            subject: email.subject,
            html: emailBody,
          };
          switch (process.env.EMAIL) {
            case "smtp":
              emailData.from = process.env.EMAIL_SMTP_SENDER!;
              await new Promise<void>((resolve, reject) => {
                smtp.sendMail(emailData, (error) => {
                  if (error) {
                    reject(new Error(error.message));
                  } else {
                    resolve();
                  }
                });
              });
              break;
            case "resend":
              emailData.from = process.env.EMAIL_RESEND_SENDER!;
              const result = await resend.emails.send(emailData);
              if (result.error) {
                throw new Error(result.error.message);
              }
              break;
            default:
              throw new Error("Invalid email provider");
          }

          sentEmails.push(recipient.email);
        }
        await db.email.update({
          where: {
            id: input.id,
          },
          data: {
            sentAt: new Date(),
          },
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        throw new Error(
          `Failed to send email. ${errorMessage} Sent emails: ${sentEmails.join(", ")}`,
        );
      }

      return { success: true };
    }),
});
