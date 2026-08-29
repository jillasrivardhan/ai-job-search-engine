export type StudentProfile={id:string;skills:string[];technologies:string[];experience:string;education:string;projects:string[];preferredRoles:string[];locationPreference:string;workPreference:string;experienceLevel:string;updatedAt:string};
export type Job={id:string;title:string;company:string;location:string;jobUrl:string;source:string;postedDate:string;description:string;requiredSkills:string[];employmentType:string;remoteType:string;salary:string;matchScore:number;matchingSkills:string[]};
export type DashboardData={profile?:StudentProfile;jobs:Job[];lastUpdated?:string};
