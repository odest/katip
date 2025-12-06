import os from "os";
import fs from "fs";
import path from "path";
import initSqlJs from "sql.js";
import { v4 as uuidv4 } from "uuid";
import { faker } from "@faker-js/faker";
import { drizzle } from "drizzle-orm/sql-js";
import * as schema from "@workspace/database/schema/sqlite";

const IDENTIFIER = "com.katip.app";
const DB_NAME = "katip.db";

const findTauriDbPath = () => {
  const homeDir = os.homedir();
  const candidates = [
    path.join(homeDir, "AppData", "Local", IDENTIFIER, DB_NAME),
    path.join(homeDir, "AppData", "Roaming", IDENTIFIER, DB_NAME),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
};

const getDbPath = () => {
  const args = process.argv.slice(2);
  if (args.length > 0) {
    return args[0];
  }

  if (process.env.DB_PATH) {
    return process.env.DB_PATH;
  }

  const tauriDb = findTauriDbPath();
  if (tauriDb) {
    console.log(`Found Tauri database at: ${tauriDb}`);
    return tauriDb;
  }

  console.log("Could not find Tauri database. Defaulting to local 'dev.db'.");
  return "dev.db";
};

const main = async () => {
  const dbPath = getDbPath();
  console.log(`Seeding database at ${dbPath}...`);

  const SQL = await initSqlJs();

  let filebuffer: Buffer | null = null;
  if (fs.existsSync(dbPath!)) {
    filebuffer = fs.readFileSync(dbPath!);
  }

  const sqlite = new SQL.Database(filebuffer);
  const db = drizzle(sqlite, { schema });

  console.log("Clearing existing data...");
  db.delete(schema.actionItems).run();
  db.delete(schema.summaries).run();
  db.delete(schema.transcripts).run();
  db.delete(schema.recordings).run();
  db.delete(schema.users).run();

  console.log("Creating users...");
  const users: (typeof schema.users.$inferInsert)[] = [];
  for (let i = 0; i < 5; i++) {
    users.push({
      id: uuidv4(),
      email: faker.internet.email(),
      fullName: faker.person.fullName(),
      avatarUrl: faker.image.avatar(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    });
  }
  db.insert(schema.users).values(users).run();

  console.log("Creating recordings...");
  const recordings: (typeof schema.recordings.$inferInsert)[] = [];
  for (const user of users) {
    const recordingCount = faker.number.int({ min: 2, max: 5 });
    for (let i = 0; i < recordingCount; i++) {
      recordings.push({
        id: uuidv4(),
        userId: user.id!,
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        filePath: faker.system.filePath(),
        fileHash: faker.string.alphanumeric(32),
        duration: faker.number.float({ min: 60, max: 3600 }),
        fileSize: faker.number.int({ min: 100000, max: 10000000 }),
        status: faker.helpers.arrayElement([
          "queued",
          "processing",
          "completed",
          "failed",
        ]),
        isFavorite: faker.datatype.boolean(),
        tags: faker.helpers.arrayElements(
          ["meeting", "lecture", "interview", "notes"],
          { min: 0, max: 3 }
        ),
        isSynced: faker.datatype.boolean(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      });
    }
  }
  db.insert(schema.recordings).values(recordings).run();

  console.log("Creating transcripts...");
  const transcripts: (typeof schema.transcripts.$inferInsert)[] = [];
  const completedRecordings = recordings.filter(
    (r) => r.status === "completed"
  );

  for (const recording of completedRecordings) {
    if (faker.datatype.boolean(0.8)) {
      transcripts.push({
        id: uuidv4(),
        recordingId: recording.id!,
        userId: recording.userId,
        language: "en",
        model: "whisper-1",
        segments: [
          { start: 0, end: 1000, text: faker.lorem.sentence() },
          { start: 1000, end: 2000, text: faker.lorem.sentence() },
        ],
        createdAt: faker.date.past(),
      });
    }
  }
  if (transcripts.length > 0) {
    db.insert(schema.transcripts).values(transcripts).run();
  }

  console.log("Creating summaries...");
  const summaries: (typeof schema.summaries.$inferInsert)[] = [];
  for (const transcript of transcripts) {
    if (faker.datatype.boolean(0.7)) {
      summaries.push({
        id: uuidv4(),
        transcriptId: transcript.id!,
        recordingId: transcript.recordingId,
        userId: transcript.userId,
        content: faker.lorem.paragraphs(2),
        provider: "openai",
        model: "gpt-4",
        createdAt: faker.date.past(),
      });
    }
  }
  if (summaries.length > 0) {
    db.insert(schema.summaries).values(summaries).run();
  }

  console.log("Creating action items...");
  const actionItems: (typeof schema.actionItems.$inferInsert)[] = [];
  for (const summary of summaries) {
    const actionItemCount = faker.number.int({ min: 0, max: 3 });
    for (let i = 0; i < actionItemCount; i++) {
      actionItems.push({
        id: uuidv4(),
        summaryId: summary.id!,
        recordingId: summary.recordingId,
        userId: summary.userId,
        task: faker.lorem.sentence(),
        assignee: faker.person.fullName(),
        isCompleted: faker.datatype.boolean(),
        priority: faker.helpers.arrayElement(["low", "medium", "high"]),
        createdAt: faker.date.past(),
      });
    }
  }
  if (actionItems.length > 0) {
    db.insert(schema.actionItems).values(actionItems).run();
  }

  console.log("Seeding completed!");

  const data = sqlite.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath!, buffer);
  console.log(`Database saved to ${dbPath}`);
};

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
