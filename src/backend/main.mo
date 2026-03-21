import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Migration "migration";

(with migration = Migration.run)
actor {
  type JobRole = {
    #softwareEngineer;
    #cybersecurityAnalyst;
    #fullStackDeveloper;
    #securityEngineer;
    #dataScientist;
    #networkEngineer;
  };

  type ApplicationStatus = {
    #pending;
    #reviewed;
    #interview;
    #offered;
    #rejected;
  };

  type JobApplication = {
    id : Nat;
    timestamp : Time.Time;
    fullName : Text;
    email : Text;
    role : JobRole;
    resumeUrl : Text;
    coverNote : Text;
    status : ApplicationStatus;
  };

  module JobApplication {
    public func compare(a : JobApplication, b : JobApplication) : { #less; #equal; #greater } {
      Nat.compare(a.id, b.id);
    };
  };

  var nextId = 1;
  var acceptingApplications = true;
  let applications = Map.empty<Nat, JobApplication>();

  public shared ({ caller }) func submitApplication(fullName : Text, email : Text, role : JobRole, resumeUrl : Text, coverNote : Text) : async Nat {
    if (not acceptingApplications) {
      Runtime.trap("Applications are currently closed");
    };

    let id = nextId;
    nextId += 1;

    let application : JobApplication = {
      id = id;
      timestamp = Time.now();
      fullName;
      email;
      role;
      resumeUrl;
      coverNote;
      status = #pending;
    };
    applications.add(id, application);
    application.id;
  };

  public shared ({ caller }) func updateApplicationStatus(id : Nat, newStatus : ApplicationStatus) : async () {
    switch (applications.get(id)) {
      case (null) {
        Runtime.trap("Application not found");
      };
      case (?application) {
        let updatedApplication : JobApplication = {
          id = application.id;
          timestamp = application.timestamp;
          fullName = application.fullName;
          email = application.email;
          role = application.role;
          resumeUrl = application.resumeUrl;
          coverNote = application.coverNote;
          status = newStatus;
        };
        applications.add(id, updatedApplication);
      };
    };
  };

  public shared ({ caller }) func setAcceptingApplications(value : Bool) : async () {
    acceptingApplications := value;
  };

  public query ({ caller }) func isAcceptingApplications() : async Bool {
    acceptingApplications;
  };

  public query ({ caller }) func getAllApplications() : async [JobApplication] {
    applications.values().toArray();
  };

  public query ({ caller }) func getTotalApplications() : async Nat {
    applications.size();
  };
};
