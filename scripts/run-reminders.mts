import { processArtistReminders } from "../src/lib/reminders";

async function run() {
  const result = await processArtistReminders();
  console.log(JSON.stringify(result, null, 2));
  if (result.errors.length > 0) process.exitCode = 1;
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
