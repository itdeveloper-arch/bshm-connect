import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import DEFAULT_OFFICERS from "../data/officers";
import DEFAULT_MILESTONES from "../data/milestones";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

const AppContext = createContext(null);

const DEFAULT_ANNOUNCEMENTS = [
  { id: "ann-1", title: "Welcome to BSHM Connect", text: "BSHM Connect is now available for student announcements, concerns, and organization updates.", date: "September 2026" },
  { id: "ann-2", title: "Student Concern Portal", text: "Students may now submit concerns and suggestions through the BSHM Connect website.", date: "September 2026" },
];

const DEFAULT_EVENTS = [
  { id: "ev-1", title: "BSHM Student Orientation", date: "September 2026", description: "An orientation for students about BSHM programs, activities, policies, and organization projects." },
  { id: "ev-2", title: "Hospitality Skills Workshop", date: "October 2026", description: "A practical workshop designed to strengthen students hospitality and service skills." },
  { id: "ev-3", title: "BSHM Hospitality Week", date: "November 2026", description: "A week-long celebration featuring competitions, activities, learning sessions, and team-building." },
];

const VALID_ROLES = ["Operator", "BSHM Officer", "Department Adviser"];

function isSafeRole(value) {
  return VALID_ROLES.includes(value) ? value : null;
}

function isObjectArray(value) {
  return Array.isArray(value) && value.every((item) => item && typeof item === "object");
}

function isText(value) {
  return typeof value === "string";
}

function isValidStoredItem(key, item) {
  if (!item || typeof item !== "object") return false;
  if (key === "bshmMilestones") {
    return isText(item.title) && isText(item.category) && isText(item.description) &&
      isText(item.date) && (!item.images || (Array.isArray(item.images) && item.images.every((image) => /^data:image\/(jpeg|png|webp);base64,/i.test(image))));
  }
  if (key === "bshmOfficersList") return isText(item.name) && isText(item.position);
  if (key === "bshmAnnouncements") return isText(item.title) && isText(item.text) && isText(item.date);
  if (key === "bshmConcerns") return isText(item.name) && isText(item.subject) && isText(item.message);
  if (key === "bshmEvents") return isText(item.title) && isText(item.description);
  return true;
}

function loadData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    if (Array.isArray(fallback)) {
      if (!isObjectArray(parsed)) return fallback;
      const validItems = parsed.filter((item) => isValidStoredItem(key, item));
      return validItems.length === parsed.length ? validItems : fallback;
    }
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function fromOfficerRow(row) {
  return { ...row, tierLevel: row.tier_level, tierName: row.tier_name, roleTag: row.role_tag, isGovernor: row.is_governor };
}

function fromMilestoneRow(row) {
  return { ...row, badgeIcon: row.badge_icon, authorRole: row.author_role, updatedAt: row.updated_at };
}

function toDatabaseRow(table, value) {
  if (table === "officers") {
    const { tierLevel, tierName, roleTag, isGovernor, ...rest } = value;
    return { ...rest, tier_level: tierLevel, tier_name: tierName, role_tag: roleTag, is_governor: isGovernor };
  }
  if (table === "milestones") {
    const { badgeIcon, authorRole, updatedAt, ...rest } = value;
    return { ...rest, badge_icon: badgeIcon, author_role: authorRole, updated_at: updatedAt };
  }
  return value;
}

async function saveToCloud(table, value) {
  try {
    const { error } = await supabase.from(table).upsert(toDatabaseRow(table, value));
    return error || null;
  } catch (error) {
    return error;
  }
}

function saveLocal(key, value) {
  try {
    const current = loadData(key, []);
    const next = current.some((item) => item.id === value.id)
      ? current.map((item) => (item.id === value.id ? value : item))
      : [value, ...current];
    localStorage.setItem(key, JSON.stringify(next));
  } catch (error) {
    console.warn("Local fallback save error", error);
  }
}

export function AppProvider({ children }) {
  const [currentRole, setCurrentRole] = useState(() => {
    if (isSupabaseConfigured) return null;
    try {
      return isSafeRole(sessionStorage.getItem("bshmRole"));
    } catch {
      return null;
    }
  });
  const [announcements, setAnnouncements] = useState(() => loadData("bshmAnnouncements", DEFAULT_ANNOUNCEMENTS));
  const [events, setEvents] = useState(() => loadData("bshmEvents", DEFAULT_EVENTS));
  const [concerns, setConcerns] = useState(() => loadData("bshmConcerns", []));
  const [officers, setOfficers] = useState(() => loadData("bshmOfficersList", DEFAULT_OFFICERS));
  const [officerPhotos, setOfficerPhotos] = useState(() => loadData("bshmOfficerPhotos", {}));
  const [milestones, setMilestones] = useState(() => loadData("bshmMilestones", DEFAULT_MILESTONES));
  const [toast, setToast] = useState({ msg: "", show: false });
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured);

  const applyAuthSession = useCallback(async (session) => {
    if (!session?.user || !isSupabaseConfigured) {
      setCurrentRole(null);
      return;
    }

    const { data, error } = await supabase
      .from("staff_profiles")
      .select("role")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (error || !isSafeRole(data?.role)) {
      setCurrentRole(null);
      await supabase.auth.signOut();
      return;
    }

    setCurrentRole(data.role);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active) {
        applyAuthSession(session).catch((error) => console.warn("Auth session error", error)).finally(() => setAuthLoading(false));
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      if (active) {
        setAuthLoading(true);
        applyAuthSession(session)
          .catch((error) => console.warn("Auth state error", error))
          .finally(() => setAuthLoading(false));
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [applyAuthSession]);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    let cancelled = false;
    const loadCloudData = async () => {
      const results = await Promise.all([
        supabase.from("announcements").select("*").order("created_at", { ascending: false }),
        supabase.from("events").select("*").order("created_at", { ascending: true }),
        supabase.from("concerns").select("*").order("created_at", { ascending: false }),
        supabase.from("officers").select("*").order("created_at", { ascending: true }),
        supabase.from("milestones").select("*").order("created_at", { ascending: false }),
      ]);

      if (cancelled) return;
      const [announcementResult, eventResult, concernResult, officerResult, milestoneResult] = results;
      if (!announcementResult.error && announcementResult.data?.length) setAnnouncements(announcementResult.data);
      if (!eventResult.error && eventResult.data?.length) setEvents(eventResult.data);
      if (!concernResult.error) setConcerns(concernResult.data || []);
      if (!officerResult.error && officerResult.data?.length) setOfficers(officerResult.data.map(fromOfficerRow));
      if (!milestoneResult.error && milestoneResult.data?.length) setMilestones(milestoneResult.data.map(fromMilestoneRow));
    };

    loadCloudData().catch((error) => console.warn("Supabase load error", error));
    return () => { cancelled = true; };
  }, []);

  const showToast = useCallback((msg) => {
    setToast({ msg, show: true });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  }, []);

  const login = useCallback((role) => {
    if (isSupabaseConfigured) return;
    const safeRole = isSafeRole(role);
    if (!safeRole) return;
    setCurrentRole(safeRole);
    sessionStorage.setItem("bshmRole", safeRole);
  }, []);

  const logout = useCallback(() => {
    setCurrentRole(null);
    sessionStorage.removeItem("bshmRole");
    if (isSupabaseConfigured) supabase.auth.signOut().catch((error) => console.warn("Sign out error", error));
  }, []);

  const addConcern = useCallback((concern) => {
    setConcerns((prev) => {
      const next = [concern, ...prev];
      if (isSupabaseConfigured) saveToCloud("concerns", concern).catch((error) => console.warn("Concern save error", error));
      else localStorage.setItem("bshmConcerns", JSON.stringify(next));
      return next;
    });
  }, []);

  const updateConcernStatus = useCallback((id, status) => {
    setConcerns((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, status } : c));
      if (isSupabaseConfigured) saveToCloud("concerns", next.find((concern) => concern.id === id)).catch((error) => console.warn("Concern update error", error));
      else localStorage.setItem("bshmConcerns", JSON.stringify(next));
      return next;
    });
  }, []);

  const addAnnouncement = useCallback((ann) => {
    setAnnouncements((prev) => {
      const next = [ann, ...prev];
      if (isSupabaseConfigured) {
        saveToCloud("announcements", ann).then((error) => {
          if (error) {
            console.warn("Announcement cloud save error", error);
            saveLocal("bshmAnnouncements", ann);
          }
        });
      } else localStorage.setItem("bshmAnnouncements", JSON.stringify(next));
      return next;
    });
  }, []);

  const updateAnnouncement = useCallback((updated) => {
    setAnnouncements((prev) => {
      const next = prev.map((announcement) => (announcement.id === updated.id ? updated : announcement));
      if (isSupabaseConfigured) saveToCloud("announcements", updated).then((error) => {
        if (error) console.warn("Announcement update error", error);
      });
      else localStorage.setItem("bshmAnnouncements", JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteAnnouncement = useCallback((id) => {
    setAnnouncements((prev) => {
      const next = prev.filter((announcement) => announcement.id !== id);
      if (isSupabaseConfigured) supabase.from("announcements").delete().eq("id", id).then(({ error }) => {
        if (error) console.warn("Announcement delete error", error);
      });
      else localStorage.setItem("bshmAnnouncements", JSON.stringify(next));
      return next;
    });
  }, []);

  const addEvent = useCallback((event) => {
    setEvents((prev) => {
      const next = [event, ...prev];
      if (isSupabaseConfigured) saveToCloud("events", event).then((error) => { if (error) console.warn("Event save error", error); });
      else localStorage.setItem("bshmEvents", JSON.stringify(next));
      return next;
    });
  }, []);

  const updateEvent = useCallback((updated) => {
    setEvents((prev) => {
      const next = prev.map((event) => (event.id === updated.id ? updated : event));
      if (isSupabaseConfigured) saveToCloud("events", updated).then((error) => { if (error) console.warn("Event update error", error); });
      else localStorage.setItem("bshmEvents", JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteEvent = useCallback((id) => {
    setEvents((prev) => {
      const next = prev.filter((event) => event.id !== id);
      if (isSupabaseConfigured) supabase.from("events").delete().eq("id", id).then(({ error }) => { if (error) console.warn("Event delete error", error); });
      else localStorage.setItem("bshmEvents", JSON.stringify(next));
      return next;
    });
  }, []);

  const addOfficer = useCallback((newOfficer) => {
    setOfficers((prev) => {
      const next = [...prev, newOfficer];
      if (isSupabaseConfigured) saveToCloud("officers", newOfficer).catch((error) => console.warn("Officer save error", error));
      else try { localStorage.setItem("bshmOfficersList", JSON.stringify(next)); } catch (err) { console.warn("Storage error", err); }
      return next;
    });
  }, []);

  const updateOfficer = useCallback((updatedOfficer) => {
    setOfficers((prev) => {
      const next = prev.map((o) => (o.id === updatedOfficer.id ? updatedOfficer : o));
      if (isSupabaseConfigured) saveToCloud("officers", updatedOfficer).catch((error) => console.warn("Officer update error", error));
      else try { localStorage.setItem("bshmOfficersList", JSON.stringify(next)); } catch (err) { console.warn("Storage error", err); }
      return next;
    });
  }, []);

  const deleteOfficer = useCallback((id) => {
    setOfficers((prev) => {
      const next = prev.filter((o) => o.id !== id);
      if (isSupabaseConfigured) supabase.from("officers").delete().eq("id", id).then(({ error }) => { if (error) console.warn("Officer delete error", error); });
      else try { localStorage.setItem("bshmOfficersList", JSON.stringify(next)); } catch (err) { console.warn("Storage error", err); }
      return next;
    });
  }, []);

  const resetOfficers = useCallback(() => {
    setOfficers(DEFAULT_OFFICERS);
    if (isSupabaseConfigured) DEFAULT_OFFICERS.forEach((officer) => saveToCloud("officers", officer).catch((error) => console.warn("Officer reset error", error)));
    else try { localStorage.setItem("bshmOfficersList", JSON.stringify(DEFAULT_OFFICERS)); } catch (err) { console.warn("Storage error", err); }
  }, []);

  const updateOfficerPhoto = useCallback((officerName, photoDataUrl) => {
    setOfficerPhotos((prev) => {
      const next = { ...prev, [officerName]: photoDataUrl };
      if (!isSupabaseConfigured) try { localStorage.setItem("bshmOfficerPhotos", JSON.stringify(next)); } catch (err) { console.warn("Storage error", err); }
      return next;
    });
  }, []);

  const removeOfficerPhoto = useCallback((officerName) => {
    setOfficerPhotos((prev) => {
      const next = { ...prev };
      delete next[officerName];
      if (!isSupabaseConfigured) try { localStorage.setItem("bshmOfficerPhotos", JSON.stringify(next)); } catch (err) { console.warn("Storage error", err); }
      return next;
    });
  }, []);

  /* MILESTONE METHODS */
  const addMilestone = useCallback((newMilestone) => {
    setMilestones((prev) => {
      const next = [newMilestone, ...prev];
      if (isSupabaseConfigured) saveToCloud("milestones", newMilestone).catch((error) => console.warn("Milestone save error", error));
      else try { localStorage.setItem("bshmMilestones", JSON.stringify(next)); } catch (err) { console.warn("Milestone storage error", err); }
      return next;
    });
  }, []);

  const updateMilestone = useCallback((updated) => {
    setMilestones((prev) => {
      const next = prev.map((m) => (m.id === updated.id ? updated : m));
      if (isSupabaseConfigured) saveToCloud("milestones", updated).catch((error) => console.warn("Milestone update error", error));
      else try { localStorage.setItem("bshmMilestones", JSON.stringify(next)); } catch (err) { console.warn("Milestone storage error", err); }
      return next;
    });
  }, []);

  const deleteMilestone = useCallback((id) => {
    setMilestones((prev) => {
      const next = prev.filter((m) => m.id !== id);
      if (isSupabaseConfigured) supabase.from("milestones").delete().eq("id", id).then(({ error }) => { if (error) console.warn("Milestone delete error", error); });
      else try { localStorage.setItem("bshmMilestones", JSON.stringify(next)); } catch (err) { console.warn("Milestone storage error", err); }
      return next;
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentRole,
        authLoading,
        login,
        logout,
        announcements,
        events,
        concerns,
        addConcern,
        updateConcernStatus,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        addEvent,
        updateEvent,
        deleteEvent,
        officers,
        addOfficer,
        updateOfficer,
        deleteOfficer,
        resetOfficers,
        officerPhotos,
        updateOfficerPhoto,
        removeOfficerPhoto,
        milestones,
        addMilestone,
        updateMilestone,
        deleteMilestone,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
