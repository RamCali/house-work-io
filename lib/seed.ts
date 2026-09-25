import { prisma } from "./prisma"
import { ensureSandboxContractors } from "./sandbox"
import bcrypt from "bcryptjs"

/**
 * Seed the database with initial data for development and sandbox mode
 */
export async function seed() {
  console.log("🌱 Seeding database...")

  // Create a demo homeowner user
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    create: {
      email: "demo@example.com",
      name: "Demo Homeowner",
      hashedPassword: await bcrypt.hash("demo123", 10),
    },
    update: {},
  })
  console.log(`✓ Created demo user: ${demoUser.email}`)

  // Create sandbox contractors
  await ensureSandboxContractors()

  // Create a demo admin
  const demoAdmin = await prisma.admin.upsert({
    where: { email: "admin@example.com" },
    create: {
      email: "admin@example.com",
      name: "Demo Operator",
      hashedPassword: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
    },
    update: {},
  })
  console.log(`✓ Created demo admin: ${demoAdmin.email}`)

  console.log("✅ Database seeded successfully!")
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Seed failed:", error)
      process.exit(1)
    })
}
