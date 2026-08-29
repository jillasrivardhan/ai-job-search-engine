import { NextResponse } from "next/server"; import { getDashboard, getProfile, replaceJobs } from "@/lib/db"; import { collectAndScore } from "@/lib/jobs";
export const runtime="nodejs";
export async function POST(){const profile=getProfile();if(!profile)return NextResponse.json({error:"Upload a resume before finding jobs."},{status:400});try{const jobs=await collectAndScore(profile);replaceJobs(jobs);return NextResponse.json(getDashboard());}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Refresh failed."},{status:500});}}
