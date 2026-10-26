import { createClient } from "@supabase/supabase-js";

// Read directly from development / environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith("http")
);

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true },
      realtime: { params: { eventsPerSecond: 10 } }
    })
  : null;

// Fallback seed complaints for offline/initial resilience
const INITIAL_COMPLAINTS = [
  {
    id: "CMP-20261026-8801",
    title: "Exposed High-Voltage Cable Near Primary School Gate",
    description: "A high voltage live wire has snapped from the utility pole and is hanging directly over the pedestrian pathway outside St. Jude School. Sparks visible during drizzle.",
    category: "Electricity & Lighting",
    severity: "Critical",
    priority: "Immediate",
    ai_confidence: 0.96,
    urgency_reasons: ["Immediate danger or structural/electrical hazard detected", "Proximity to vulnerable institution (school/hospital/public transport)"],
    location: "St. Jude School Road, Central District",
    latitude: 12.9716,
    longitude: 77.5946,
    population: "High",
    status: "In Progress",
    image_url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
    department: "State Power Distribution Corp (Electricity Board)",
    official_notes: "Emergency crew dispatched. Power isolated on sub-circuit 4. Lineman team on site repairing cable.",
    citizen_name: "Anand Sharma",
    citizen_contact: "+91 98765 43210",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: "CMP-20261026-6412",
    title: "Massive Water Main Rupture Flooding Sub-Highway",
    description: "Underground clean drinking water main burst. Thousands of gallons gushing out per minute, submerging two lanes and causing severe soil erosion around storm drain.",
    category: "Water Supply & Sewage",
    severity: "High",
    priority: "Urgent",
    ai_confidence: 0.92,
    urgency_reasons: ["Immediate danger or structural/electrical hazard detected"],
    location: "Outer Ring Road, Near Tech Park Junction",
    latitude: 12.9352,
    longitude: 77.6245,
    population: "High",
    status: "In Progress",
    image_url: "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80",
    department: "Municipal Water Supply & Sewerage Authority",
    official_notes: "Valves V-12 and V-14 shut off. Heavy excavator arriving for joint replacement.",
    citizen_name: "Priya Nair",
    citizen_contact: "+91 91234 56789",
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: "CMP-20261025-3319",
    title: "Deep Potholes and Fractured Culvert on Market Road",
    description: "Multiple deep potholes across 200m stretch. Two delivery scooters skidded this morning. Fractured concrete culvert with exposed rebar.",
    category: "Roads & Infrastructure",
    severity: "Medium",
    priority: "Elevated",
    ai_confidence: 0.89,
    urgency_reasons: ["Accident hazard reported"],
    location: "Old Bazaar 4th Cross, City Market",
    latitude: 12.9654,
    longitude: 77.5781,
    population: "Medium",
    status: "Submitted",
    image_url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
    department: "Public Works Department (PWD - Roads & Bridges)",
    official_notes: "Queued for zonal engineering inspection on Monday morning.",
    citizen_name: "Rajesh Kumar",
    citizen_contact: "rajesh.k@gmail.com",
    created_at: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1.5).toISOString()
  }
];

let localCache = [...INITIAL_COMPLAINTS];

// 1. Fetch all complaints
export async function fetchAllComplaints() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Supabase complaints fetch warning:", error.message);
      } else if (data) {
        return { complaints: data, source: "supabase" };
      }
    } catch (err) {
      console.warn("Supabase fetch failed:", err);
    }
  }

  return { complaints: localCache, source: "local" };
}

// 2. Fetch complaint by ID
export async function fetchComplaintById(id) {
  const cleanId = (id || "").trim();
  if (!cleanId) return null;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .eq("id", cleanId)
        .maybeSingle();

      if (!error && data) return data;
    } catch (err) {
      console.warn("Supabase single fetch failed:", err);
    }
  }

  return localCache.find(c => c.id.toLowerCase() === cleanId.toLowerCase()) || null;
}

// 3. Create a new complaint with image upload
export async function submitNewComplaint(complaintData, imageFile = null) {
  let uploadedImageUrl = null;

  // Handle Image Upload to Supabase Storage
  if (imageFile) {
    if (supabase) {
      try {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${complaintData.id}_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("complaint-evidence")
          .upload(fileName, imageFile);

        if (!uploadError) {
          const { data: publicData } = supabase.storage
            .from("complaint-evidence")
            .getPublicUrl(fileName);
          uploadedImageUrl = publicData?.publicUrl || null;
        }
      } catch (storageErr) {
        console.warn("Storage upload exception:", storageErr);
      }
    }

    // Fallback to data URL
    if (!uploadedImageUrl) {
      uploadedImageUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(imageFile);
      });
    }
  }

  const recordToInsert = {
    id: complaintData.id,
    title: complaintData.title || (complaintData.description.slice(0, 60) + "..."),
    description: complaintData.description,
    category: complaintData.category,
    severity: complaintData.severity || "Medium",
    priority: complaintData.priority || "Normal",
    ai_confidence: complaintData.ai_confidence || 0.85,
    urgency_reasons: complaintData.urgency_reasons || [],
    location: complaintData.location,
    latitude: complaintData.latitude ? Number(complaintData.latitude) : null,
    longitude: complaintData.longitude ? Number(complaintData.longitude) : null,
    population: complaintData.population || "Medium",
    status: "Submitted",
    image_url: uploadedImageUrl,
    department: complaintData.department || "General Municipal Administration",
    official_notes: "Complaint received into the civic queue. Scheduled for triage.",
    citizen_name: complaintData.citizen_name || "Anonymous Citizen",
    citizen_contact: complaintData.citizen_contact || "Not provided",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .insert([recordToInsert])
        .select()
        .single();

      if (!error && data) {
        return { success: true, complaint: data, source: "supabase" };
      } else if (error) {
        console.warn("Supabase insert warning:", error.message);
      }
    } catch (insertErr) {
      console.warn("Supabase insert exception:", insertErr);
    }
  }

  localCache = [recordToInsert, ...localCache];
  return { success: true, complaint: recordToInsert, source: "local" };
}

// 4. Update complaint status & notes
export async function updateComplaintStatus(id, newStatus, officialNotes = "", department = "") {
  const now = new Date().toISOString();
  const updatePayload = {
    status: newStatus,
    updated_at: now
  };
  if (officialNotes) updatePayload.official_notes = officialNotes;
  if (department) updatePayload.department = department;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (!error && data) {
        return { success: true, complaint: data, source: "supabase" };
      }
    } catch (updateErr) {
      console.warn("Supabase update error:", updateErr);
    }
  }

  const idx = localCache.findIndex(c => c.id === id);
  if (idx !== -1) {
    localCache[idx] = { ...localCache[idx], ...updatePayload };
    return { success: true, complaint: localCache[idx], source: "local" };
  }

  return { success: false, message: "Complaint not found" };
}

// 5. Subscribe to realtime changes
export function subscribeToComplaints(onUpdate) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel("public:complaints")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "complaints" },
      (payload) => {
        onUpdate(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// 6. Supabase Authentication for Admin Panel
export async function signInAdmin(email, password) {
  if (!supabase) return { error: { message: "Supabase client not initialized." } };
  return await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: password.trim()
  });
}

export async function signUpAdmin(email, password) {
  if (!supabase) return { error: { message: "Supabase client not initialized." } };
  return await supabase.auth.signUp({
    email: email.trim(),
    password: password.trim()
  });
}

export async function signOutAdmin() {
  if (!supabase) return;
  return await supabase.auth.signOut();
}

export async function getAdminSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data?.session || null;
}

export function onAdminAuthStateChange(callback) {
  if (!supabase) return () => {};
  const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  return () => {
    listener?.subscription?.unsubscribe();
  };
}

// 7. Full Admin Update
export async function adminUpdateComplaint(id, fields) {
  const now = new Date().toISOString();
  const updatePayload = {
    ...fields,
    updated_at: now
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (!error && data) {
        return { success: true, complaint: data, source: "supabase" };
      }
      if (error) throw error;
    } catch (updateErr) {
      console.warn("Supabase admin update error:", updateErr);
      return { success: false, message: updateErr.message };
    }
  }

  const idx = localCache.findIndex(c => c.id === id);
  if (idx !== -1) {
    localCache[idx] = { ...localCache[idx], ...updatePayload };
    return { success: true, complaint: localCache[idx], source: "local" };
  }
  return { success: false, message: "Record not found" };
}

// 8. Admin Delete
export async function deleteComplaint(id) {
  if (supabase) {
    try {
      const { error } = await supabase
        .from("complaints")
        .delete()
        .eq("id", id);

      if (!error) {
        return { success: true };
      }
      throw error;
    } catch (delErr) {
      console.warn("Supabase delete error:", delErr);
      return { success: false, message: delErr.message };
    }
  }

  localCache = localCache.filter(c => c.id !== id);
  return { success: true };
}

