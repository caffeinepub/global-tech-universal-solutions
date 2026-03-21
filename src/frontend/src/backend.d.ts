import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface JobApplication {
    id: bigint;
    status: ApplicationStatus;
    role: JobRole;
    fullName: string;
    email: string;
    timestamp: Time;
    coverNote: string;
    resumeUrl: string;
}
export type Time = bigint;
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
export interface backendInterface {
    getAllApplications(): Promise<Array<JobApplication>>;
    getTotalApplications(): Promise<bigint>;
    isAcceptingApplications(): Promise<boolean>;
    setAcceptingApplications(value: boolean): Promise<void>;
    submitApplication(fullName: string, email: string, role: JobRole, resumeUrl: string, coverNote: string): Promise<bigint>;
    updateApplicationStatus(id: bigint, newStatus: ApplicationStatus): Promise<void>;
}
