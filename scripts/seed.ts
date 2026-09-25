import { seed } from "../lib/seed"

seed()
  .then(() => {
    console.log("✅ Seed complete")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Seed failed:", error)
    process.exit(1)
  })
