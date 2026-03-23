import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  BanIcon,
  CheckCircle2,
  Loader2,
  MapPin,
  MapPinOff,
  Send,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { JobRole } from "../backend.d";
import { createActorWithConfig } from "../config";

const roleOptions: { value: JobRole; label: string }[] = [
  { value: JobRole.softwareEngineer, label: "Software Engineer" },
  { value: JobRole.fullStackDeveloper, label: "Full Stack Developer" },
  { value: JobRole.dataScientist, label: "Data Scientist" },
  { value: JobRole.cybersecurityAnalyst, label: "Cybersecurity Analyst" },
  { value: JobRole.securityEngineer, label: "Security Engineer" },
  { value: JobRole.networkEngineer, label: "Network Engineer" },
];

interface FormState {
  fullName: string;
  email: string;
  role: string;
  resumeUrl: string;
  coverNote: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  role?: string;
  resumeUrl?: string;
  coverNote?: string;
}

interface Props {
  selectedRole: string;
  onRoleChange: (role: string) => void;
}

type LocationState =
  | { status: "idle" }
  | { status: "requesting" }
  | { status: "captured"; latitude: number; longitude: number; label: string }
  | { status: "denied" }
  | { status: "error"; message: string };

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.fullName.trim()) errors.fullName = "Full name is required.";
  if (!form.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!form.role) errors.role = "Please select a role.";
  if (!form.resumeUrl.trim()) {
    errors.resumeUrl = "LinkedIn / Resume URL is required.";
  } else {
    try {
      new URL(form.resumeUrl);
    } catch {
      errors.resumeUrl = "Enter a valid URL.";
    }
  }
  if (!form.coverNote.trim()) errors.coverNote = "Cover note is required.";
  else if (form.coverNote.length > 500)
    errors.coverNote = "Cover note must be under 500 characters.";
  return errors;
}

export default function ApplicationForm({ selectedRole, onRoleChange }: Props) {
  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    role: "",
    resumeUrl: "",
    coverNote: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [acceptingApplications, setAcceptingApplications] = useState<
    boolean | null
  >(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [locationState, setLocationState] = useState<LocationState>({
    status: "idle",
  });
  const locationRequested = useRef(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const actor = await createActorWithConfig();
        const accepting = await actor.isAcceptingApplications();
        if (!cancelled) setAcceptingApplications(accepting);
      } catch (err) {
        console.error(err);
        if (!cancelled) setAcceptingApplications(true);
      } finally {
        if (!cancelled) setCheckingStatus(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-request location once the form is visible and accepting
  useEffect(() => {
    if (
      !checkingStatus &&
      acceptingApplications &&
      !locationRequested.current
    ) {
      locationRequested.current = true;
      requestLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkingStatus, acceptingApplications]);

  useEffect(() => {
    if (selectedRole) {
      setForm((prev) => ({ ...prev, role: selectedRole }));
      onRoleChange(selectedRole);
    }
  }, [selectedRole, onRoleChange]);

  const setField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationState({
        status: "error",
        message: "Geolocation is not supported by your browser.",
      });
      return;
    }
    setLocationState({ status: "requesting" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const label = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        setLocationState({ status: "captured", latitude, longitude, label });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setLocationState({ status: "denied" });
        } else {
          setLocationState({
            status: "error",
            message: "Unable to retrieve your location.",
          });
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate(form);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const role = form.role as JobRole;
      const actor = await createActorWithConfig();

      let latitude: number | null = null;
      let longitude: number | null = null;
      let locationLabel: string | null = null;

      if (locationState.status === "captured") {
        latitude = locationState.latitude;
        longitude = locationState.longitude;
        locationLabel = locationState.label;
      }

      await actor.submitApplication(
        form.fullName.trim(),
        form.email.trim(),
        role,
        form.resumeUrl.trim(),
        form.coverNote.trim(),
        latitude,
        longitude,
        locationLabel,
      );
      setSubmitted(true);
      toast.success("Your application has been submitted! We'll be in touch.");
      setForm({
        fullName: "",
        email: "",
        role: "",
        resumeUrl: "",
        coverNote: "",
      });
      locationRequested.current = false;
      setLocationState({ status: "idle" });
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    background: "oklch(0.13 0.025 255)",
    borderColor: "oklch(0.25 0.04 255)",
    color: "oklch(0.94 0.01 230)",
  };

  return (
    <section
      id="apply"
      ref={sectionRef}
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{ background: "oklch(0.10 0.02 255)" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 20% 70%, oklch(0.84 0.18 200 / 0.04) 0%, transparent 60%)",
        }}
      />
      <div className="section-divider absolute top-0 left-0 right-0" />

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase mb-4"
            style={{
              border: "1px solid oklch(0.84 0.18 200 / 0.3)",
              background: "oklch(0.84 0.18 200 / 0.06)",
              color: "oklch(0.84 0.18 200)",
            }}
          >
            Get Started
          </div>
          <h2
            className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3"
            style={{ color: "oklch(0.97 0.01 230)" }}
          >
            Apply Now
          </h2>
          <p className="text-base" style={{ color: "oklch(0.60 0.025 230)" }}>
            Take the next step in your career
          </p>
        </div>

        <div
          className="rounded-2xl p-8 md:p-10 relative overflow-hidden"
          style={{
            background: "oklch(0.12 0.022 255)",
            border: "1px solid oklch(0.22 0.035 255)",
            boxShadow: "0 20px 60px oklch(0 0 0 / 0.4)",
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, oklch(0.84 0.18 200 / 0.5), transparent)",
            }}
          />

          {checkingStatus ? (
            <div
              className="flex flex-col items-center justify-center text-center py-12 gap-4"
              data-ocid="application_form.loading_state"
            >
              <Loader2
                size={40}
                className="animate-spin"
                style={{ color: "oklch(0.84 0.18 200)" }}
              />
              <p className="text-sm" style={{ color: "oklch(0.55 0.025 230)" }}>
                Checking application status…
              </p>
            </div>
          ) : !acceptingApplications ? (
            <div
              className="flex flex-col items-center text-center py-10 gap-5"
              data-ocid="application_form.error_state"
            >
              <div
                className="flex items-center justify-center w-16 h-16 rounded-full"
                style={{
                  background: "oklch(0.55 0.18 30 / 0.12)",
                  border: "1px solid oklch(0.55 0.18 30 / 0.3)",
                }}
              >
                <BanIcon
                  size={32}
                  style={{ color: "oklch(0.72 0.18 30)" }}
                  strokeWidth={1.5}
                />
              </div>
              <div className="space-y-2">
                <h3
                  className="font-display text-xl font-bold"
                  style={{ color: "oklch(0.97 0.01 230)" }}
                >
                  Applications Currently Closed
                </h3>
                <p
                  className="text-sm max-w-sm mx-auto leading-relaxed"
                  style={{ color: "oklch(0.58 0.025 230)" }}
                >
                  We are not accepting new applications at this time. Please
                  check back later — new opportunities open regularly.
                </p>
              </div>
            </div>
          ) : submitted ? (
            <div className="flex flex-col items-center text-center py-8 gap-4">
              <CheckCircle2
                size={56}
                style={{ color: "oklch(0.75 0.18 145)" }}
                strokeWidth={1.5}
              />
              <h3
                className="font-display text-2xl font-bold"
                style={{ color: "oklch(0.97 0.01 230)" }}
              >
                Application Submitted!
              </h3>
              <p style={{ color: "oklch(0.60 0.025 230)" }}>
                Thank you for applying. We'll review your application and reach
                out soon.
              </p>
              <Button
                onClick={() => setSubmitted(false)}
                className="mt-2 font-semibold px-6 py-2 rounded-md"
                style={{
                  background: "oklch(0.84 0.18 200 / 0.12)",
                  color: "oklch(0.84 0.18 200)",
                  border: "1px solid oklch(0.84 0.18 200 / 0.3)",
                }}
              >
                Submit Another Application
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {/* Location Status Banner */}
              {locationState.status === "requesting" && (
                <div
                  className="rounded-xl p-4 flex items-center gap-3"
                  style={{
                    background: "oklch(0.84 0.18 200 / 0.07)",
                    border: "1px solid oklch(0.84 0.18 200 / 0.25)",
                  }}
                  data-ocid="application_form.loading_state"
                >
                  <Loader2
                    size={18}
                    className="animate-spin"
                    style={{ color: "oklch(0.84 0.18 200)" }}
                  />
                  <p
                    className="text-sm flex-1"
                    style={{ color: "oklch(0.75 0.02 230)" }}
                  >
                    Detecting your location…
                  </p>
                </div>
              )}

              {locationState.status === "captured" && (
                <div
                  className="rounded-xl p-4 flex items-center gap-3"
                  style={{
                    background: "oklch(0.75 0.18 145 / 0.08)",
                    border: "1px solid oklch(0.75 0.18 145 / 0.3)",
                  }}
                  data-ocid="application_form.success_state"
                >
                  <CheckCircle2
                    size={18}
                    style={{ color: "oklch(0.75 0.18 145)" }}
                  />
                  <div className="flex-1">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "oklch(0.75 0.18 145)" }}
                    >
                      Location included
                    </p>
                    <p
                      className="text-xs mt-0.5 font-mono"
                      style={{ color: "oklch(0.60 0.025 230)" }}
                    >
                      {locationState.latitude.toFixed(6)}°,{" "}
                      {locationState.longitude.toFixed(6)}°
                    </p>
                  </div>
                </div>
              )}

              {locationState.status === "denied" && (
                <div
                  className="rounded-xl p-4 flex items-center gap-3"
                  style={{
                    background: "oklch(0.55 0.18 30 / 0.06)",
                    border: "1px solid oklch(0.55 0.18 30 / 0.22)",
                  }}
                >
                  <MapPinOff
                    size={16}
                    style={{ color: "oklch(0.65 0.14 30)" }}
                  />
                  <p
                    className="text-sm flex-1"
                    style={{ color: "oklch(0.65 0.14 30)" }}
                  >
                    Location access denied — your application will be submitted
                    without location data
                  </p>
                </div>
              )}

              {locationState.status === "error" && (
                <div
                  className="rounded-xl p-4 flex items-center gap-3"
                  style={{
                    background: "oklch(0.55 0.18 30 / 0.08)",
                    border: "1px solid oklch(0.55 0.18 30 / 0.3)",
                  }}
                  data-ocid="application_form.error_state"
                >
                  <AlertCircle
                    size={16}
                    style={{ color: "oklch(0.72 0.18 30)" }}
                  />
                  <p
                    className="text-sm flex-1"
                    style={{ color: "oklch(0.72 0.18 30)" }}
                  >
                    {locationState.message}
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={requestLocation}
                    className="text-xs h-7"
                    style={{ color: "oklch(0.55 0.025 230)" }}
                  >
                    Retry
                  </Button>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="fullName"
                  className="text-sm font-medium"
                  style={{ color: "oklch(0.80 0.02 230)" }}
                >
                  Full Name{" "}
                  <span style={{ color: "oklch(0.84 0.18 200)" }}>*</span>
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Jane Doe"
                  value={form.fullName}
                  onChange={(e) => setField("fullName", e.target.value)}
                  className="input-cyber h-11 rounded-md"
                  style={inputStyle}
                  aria-invalid={!!errors.fullName}
                  data-ocid="application_form.input"
                />
                {errors.fullName && (
                  <p
                    className="flex items-center gap-1.5 text-xs"
                    style={{ color: "oklch(0.70 0.22 30)" }}
                    data-ocid="application_form.error_state"
                  >
                    <AlertCircle size={12} /> {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium"
                  style={{ color: "oklch(0.80 0.02 230)" }}
                >
                  Email Address{" "}
                  <span style={{ color: "oklch(0.84 0.18 200)" }}>*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  className="input-cyber h-11 rounded-md"
                  style={inputStyle}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p
                    className="flex items-center gap-1.5 text-xs"
                    style={{ color: "oklch(0.70 0.22 30)" }}
                  >
                    <AlertCircle size={12} /> {errors.email}
                  </p>
                )}
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label
                  htmlFor="role"
                  className="text-sm font-medium"
                  style={{ color: "oklch(0.80 0.02 230)" }}
                >
                  Role <span style={{ color: "oklch(0.84 0.18 200)" }}>*</span>
                </Label>
                <Select
                  value={form.role}
                  onValueChange={(val) => setField("role", val)}
                >
                  <SelectTrigger
                    id="role"
                    className="h-11 rounded-md input-cyber"
                    style={inputStyle}
                    aria-invalid={!!errors.role}
                  >
                    <SelectValue placeholder="Select a role..." />
                  </SelectTrigger>
                  <SelectContent
                    style={{
                      background: "oklch(0.14 0.025 255)",
                      border: "1px solid oklch(0.25 0.04 255)",
                    }}
                  >
                    {roleOptions.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className="text-sm cursor-pointer"
                        style={{ color: "oklch(0.85 0.01 230)" }}
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p
                    className="flex items-center gap-1.5 text-xs"
                    style={{ color: "oklch(0.70 0.22 30)" }}
                  >
                    <AlertCircle size={12} /> {errors.role}
                  </p>
                )}
              </div>

              {/* Resume URL */}
              <div className="space-y-2">
                <Label
                  htmlFor="resumeUrl"
                  className="text-sm font-medium"
                  style={{ color: "oklch(0.80 0.02 230)" }}
                >
                  LinkedIn / Resume URL{" "}
                  <span style={{ color: "oklch(0.84 0.18 200)" }}>*</span>
                </Label>
                <Input
                  id="resumeUrl"
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={form.resumeUrl}
                  onChange={(e) => setField("resumeUrl", e.target.value)}
                  className="input-cyber h-11 rounded-md"
                  style={inputStyle}
                  aria-invalid={!!errors.resumeUrl}
                />
                {errors.resumeUrl && (
                  <p
                    className="flex items-center gap-1.5 text-xs"
                    style={{ color: "oklch(0.70 0.22 30)" }}
                  >
                    <AlertCircle size={12} /> {errors.resumeUrl}
                  </p>
                )}
              </div>

              {/* Cover Note */}
              <div className="space-y-2">
                <Label
                  htmlFor="coverNote"
                  className="text-sm font-medium flex items-center justify-between"
                  style={{ color: "oklch(0.80 0.02 230)" }}
                >
                  <span>
                    Cover Note{" "}
                    <span style={{ color: "oklch(0.84 0.18 200)" }}>*</span>
                  </span>
                  <span
                    className="text-xs font-normal"
                    style={{
                      color:
                        form.coverNote.length > 480
                          ? "oklch(0.70 0.22 30)"
                          : "oklch(0.50 0.02 230)",
                    }}
                  >
                    {form.coverNote.length}/500
                  </span>
                </Label>
                <Textarea
                  id="coverNote"
                  placeholder="Tell us why you're a great fit and what you're looking for in your next role..."
                  value={form.coverNote}
                  onChange={(e) => setField("coverNote", e.target.value)}
                  maxLength={500}
                  rows={5}
                  className="input-cyber resize-none rounded-md"
                  style={inputStyle}
                  aria-invalid={!!errors.coverNote}
                />
                {errors.coverNote && (
                  <p
                    className="flex items-center gap-1.5 text-xs"
                    style={{ color: "oklch(0.70 0.22 30)" }}
                  >
                    <AlertCircle size={12} /> {errors.coverNote}
                  </p>
                )}
              </div>

              {/* Location note */}
              <p
                className="text-xs flex items-center gap-1.5"
                style={{ color: "oklch(0.45 0.02 230)" }}
              >
                <MapPin size={11} />
                Your location is automatically included to help assign
                correspondence.
              </p>

              <Button
                type="submit"
                disabled={isSubmitting}
                data-ocid="application_form.submit_button"
                className="w-full h-12 font-semibold text-base rounded-md btn-pulse transition-all duration-200"
                style={{
                  background: "oklch(0.84 0.18 200)",
                  color: "oklch(0.09 0.018 255)",
                  border: "none",
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Application
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>

      <div className="section-divider absolute bottom-0 left-0 right-0" />
    </section>
  );
}
