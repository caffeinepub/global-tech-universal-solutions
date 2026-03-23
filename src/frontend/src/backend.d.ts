import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface GpsCoordinates {
    latitude: number;
    longitude: number;
}
export interface VisitorLog {
    id: bigint;
    latitude?: number;
    locationAccess: boolean;
    longitude?: number;
    timestamp: Time;
    userAgent: string;
}
export interface JobApplication {
    id: bigint;
    status: ApplicationStatus;
    role: JobRole;
    fullName: string;
    email: string;
    timestamp: Time;
    locationLabel?: string;
    coverNote: string;
    location?: GpsCoordinates;
    resumeUrl: string;
}
export interface UserProfile {
    name: string;
}
export enum ApplicationStatus {
    pending = "pending",
    interview = "interview",
    rejected = "rejected",
    reviewed = "reviewed",
    offered = "offered"
}
export enum JobRole {
    fullStackDeveloper = "fullStackDeveloper",
    securityEngineer = "securityEngineer",
    cybersecurityAnalyst = "cybersecurityAnalyst",
    softwareEngineer = "softwareEngineer",
    networkEngineer = "networkEngineer",
    dataScientist = "dataScientist"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    blockEmail(email: string): Promise<void>;
    getAllApplications(): Promise<Array<JobApplication>>;
    getBlockedEmails(): Promise<Array<string>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getTotalApplications(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVisitorLogs(): Promise<Array<VisitorLog>>;
    isAcceptingApplications(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isEmailBlocked(email: string): Promise<boolean>;
    logVisitorLocation(latitude: number, longitude: number, userAgent: string): Promise<void>;
    logVisitorNoLocation(userAgent: string): Promise<void>;
    resetAdminClaim(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setAcceptingApplications(value: boolean): Promise<void>;
    submitApplication(fullName: string, email: string, role: JobRole, resumeUrl: string, coverNote: string, latitude: number | null, longitude: number | null, locationLabel: string | null): Promise<bigint>;
    unblockEmail(email: string): Promise<void>;
    updateApplicationStatus(id: bigint, newStatus: ApplicationStatus): Promise<void>;
}
