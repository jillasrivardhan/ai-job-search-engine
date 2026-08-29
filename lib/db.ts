import Database from "better-sqlite3";
import fs from "fs"; import path from "path";
import type { DashboardData, Job, StudentProfile } from "./types";
const dbPath=process.env.DATABASE_URL?.replace(/^file:/,"") || path.join(process.cwd(),"data","job-hunter.db"); fs.mkdirSync(path.dirname(dbPath),{recursive:true});
const globalDb=global as typeof globalThis & {jobHunterDb?:Database.Database};
const db=globalDb.jobHunterDb ?? new Database(dbPath); globalDb.jobHunterDb=db;
db.exec("CREATE TABLE IF NOT EXISTS profile (id TEXT PRIMARY KEY, payload TEXT NOT NULL, updated_at TEXT NOT NULL); CREATE TABLE IF NOT EXISTS jobs (id TEXT PRIMARY KEY, profile_id TEXT NOT NULL, payload TEXT NOT NULL, updated_at TEXT NOT NULL);");
export function getProfile(){const row=db.prepare("SELECT payload FROM profile WHERE id='default'").get() as {payload:string}|undefined;return row?JSON.parse(row.payload) as StudentProfile:undefined;}
export function saveProfile(profile:StudentProfile){db.prepare("INSERT INTO profile(id,payload,updated_at) VALUES('default',?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at").run(JSON.stringify(profile),profile.updatedAt);}
export function getDashboard():DashboardData{const profile=getProfile();const rows=db.prepare("SELECT payload,updated_at FROM jobs WHERE profile_id='default' ORDER BY json_extract(payload,'$.matchScore') DESC").all() as {payload:string;updated_at:string}[];return {profile,jobs:rows.map(r=>JSON.parse(r.payload)),lastUpdated:rows[0]?.updated_at};}
export function replaceJobs(jobs:Job[]){const now=new Date().toISOString();const tx=db.transaction(()=>{db.prepare("DELETE FROM jobs WHERE profile_id='default'").run();const put=db.prepare("INSERT INTO jobs(id,profile_id,payload,updated_at) VALUES(?,?,?,?)");jobs.forEach(j=>put.run(j.id,"default",JSON.stringify(j),now));});tx();}
