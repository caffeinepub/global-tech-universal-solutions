import Map "mo:core/Map";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";



actor {
  // Use prefabricated access control state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

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

  type GpsCoordinates = {
    latitude : Float;
    longitude : Float;
  };

  type VisitorLog = {
    id : Nat;
    timestamp : Time.Time;
    locationAccess : Bool;
    latitude : ?Float;
    longitude : ?Float;
    userAgent : Text;
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
    location : ?GpsCoordinates;
    locationLabel : ?Text;
  };

  type UserProfile = {
    name : Text;
  };

  var nextId = 1;
  var nextVisitorLogId = 1;
  var acceptingApplications = true;
  let applications = Map.empty<Nat, JobApplication>();
  let blockedEmails = Set.empty<Text>();
  let visitorLogs = Map.empty<Nat, VisitorLog>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Reset admin claim so a new admin can be registered
  // FIXED: Added admin-only authorization check
  public shared ({ caller }) func resetAdminClaim() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can reset admin claim");
    };
    accessControlState.adminAssigned := false;
    for ((principal, _) in accessControlState.userRoles.entries()) {
      accessControlState.userRoles.remove(principal);
    };
  };

  public shared ({ caller }) func submitApplication(fullName : Text, email : Text, role : JobRole, resumeUrl : Text, coverNote : Text, latitude : ?Float, longitude : ?Float, locationLabel : ?Text) : async Nat {
    if (not acceptingApplications) {
      Runtime.trap("Applications are currently closed");
    };

    if (blockedEmails.contains(email.toLower())) {
      Runtime.trap("This email has opted out of receiving messages");
    };

    let id = nextId;
    nextId += 1;

    let location = switch (latitude, longitude) {
      case (?lat, ?lon) { ?{ latitude = lat; longitude = lon } };
      case (_, _) { null };
    };

    let application : JobApplication = {
      id = id;
      timestamp = Time.now();
      fullName;
      email;
      role;
      resumeUrl;
      coverNote;
      status = #pending;
      location;
      locationLabel;
    };
    applications.add(id, application);
    application.id;
  };

  public shared ({ caller }) func updateApplicationStatus(id : Nat, newStatus : ApplicationStatus) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update application status");
    };

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
          location = application.location;
          locationLabel = application.locationLabel;
        };
        applications.add(id, updatedApplication);
      };
    };
  };

  public shared ({ caller }) func setAcceptingApplications(value : Bool) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update this setting");
    };
    acceptingApplications := value;
  };

  public query ({ caller }) func isAcceptingApplications() : async Bool {
    acceptingApplications;
  };

  // FIXED: Added admin-only authorization check
  // This prevents arbitrary users from blocking email addresses
  public shared ({ caller }) func blockEmail(email : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can block emails");
    };
    blockedEmails.add(email.toLower());
  };

  public query ({ caller }) func isEmailBlocked(email : Text) : async Bool {
    blockedEmails.contains(email.toLower());
  };

  public query ({ caller }) func getBlockedEmails() : async [Text] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access this data");
    };
    blockedEmails.toArray();
  };

  public shared ({ caller }) func unblockEmail(email : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    blockedEmails.remove(email.toLower());
  };

  public query ({ caller }) func getAllApplications() : async [JobApplication] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access this data");
    };
    applications.values().toArray();
  };

  public query ({ caller }) func getTotalApplications() : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access this data");
    };
    applications.size();
  };

  public shared ({ caller }) func logVisitorLocation(latitude : Float, longitude : Float, userAgent : Text) : async () {
    let logId = nextVisitorLogId;
    nextVisitorLogId += 1;
    let visitorLog : VisitorLog = {
      id = logId;
      timestamp = Time.now();
      locationAccess = true;
      latitude = ?latitude;
      longitude = ?longitude;
      userAgent;
    };
    visitorLogs.add(logId, visitorLog);
  };

  public shared ({ caller }) func logVisitorNoLocation(userAgent : Text) : async () {
    let logId = nextVisitorLogId;
    nextVisitorLogId += 1;
    let visitorLog : VisitorLog = {
      id = logId;
      timestamp = Time.now();
      locationAccess = false;
      latitude = null;
      longitude = null;
      userAgent;
    };
    visitorLogs.add(logId, visitorLog);
  };

  public query ({ caller }) func getVisitorLogs() : async [VisitorLog] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access this data");
    };
    visitorLogs.values().toArray();
  };

  // User profile functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };
};
