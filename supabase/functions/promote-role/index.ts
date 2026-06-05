import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const VALID_ROLES = ["owner", "admin", "moderator", "user"] as const;
type Role = (typeof VALID_ROLES)[number];

// Role hierarchy: only promote to a level <= your own level
const ROLE_LEVELS: Record<Role, number> = {
  owner: 4,
  admin: 3,
  moderator: 2,
  user: 1,
};

// First-time owner bootstrap secret
const BOOTSTRAP_SECRET = Deno.env.get("BOOTSTRAP_SECRET") || "";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return errorResponse("Missing authorization header", 401);
    }

    // Verify JWT token
    const token = authHeader.replace("Bearer ", "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Get the caller's user info from the token
    const userResponse = await fetch(
      `${supabaseUrl}/auth/v1/user`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: supabaseAnonKey,
        },
      }
    );

    if (!userResponse.ok) {
      return errorResponse("Invalid token", 401);
    }

    const caller = await userResponse.json();
    const callerId = caller.id;

    // Parse request body
    const body = await req.json();
    const { targetUserId, newRole, bootstrapSecret } = body as {
      targetUserId: string;
      newRole: string;
      bootstrapSecret?: string;
    };

    // Validate inputs
    if (!targetUserId || !newRole) {
      return errorResponse("Missing targetUserId or newRole");
    }

    if (!VALID_ROLES.includes(newRole as Role)) {
      return errorResponse(`Invalid role. Must be one of: ${VALID_ROLES.join(", ")}`);
    }

    const targetRole = newRole as Role;

    // === BOOTSTRAP MODE ===
    // If no owners exist yet, allow first promotion using a bootstrap secret
    if (bootstrapSecret) {
      if (bootstrapSecret !== BOOTSTRAP_SECRET) {
        return errorResponse("Invalid bootstrap secret", 403);
      }
      if (!BOOTSTRAP_SECRET) {
        return errorResponse("Bootstrap not configured. Set BOOTSTRAP_SECRET env var.", 403);
      }
      if (targetRole !== "owner") {
        return errorResponse("Bootstrap can only create the first owner", 403);
      }

      // Check if any owner already exists
      const ownersResponse = await fetch(
        `${supabaseUrl}/rest/v1/users?id=select&id=eq.owner_count&role=eq.owner&select=id`,
        {
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
        }
      );

      // Actually query properly
      const countResponse = await fetch(
        `${supabaseUrl}/rest/v1/users?role=eq.owner&select=id`,
        {
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            Prefer: "count=exact",
          },
        }
      );

      if (countResponse.ok) {
        const owners = await countResponse.json();
        if (Array.isArray(owners) && owners.length > 0) {
          return errorResponse("Owner already exists. Use normal promotion flow.", 403);
        }
      }

      // Promote using service role key
      const updateResponse = await fetch(
        `${supabaseUrl}/rest/v1/users?id=eq.${targetUserId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({ role: "owner" }),
        }
      );

      if (!updateResponse.ok) {
        const err = await updateResponse.json();
        return errorResponse(`Failed to promote user: ${JSON.stringify(err)}`, 500);
      }

      return successResponse({
        message: "Bootstrap owner created successfully",
        userId: targetUserId,
        role: "owner",
      });
    }

    // === NORMAL PROMOTION MODE ===
    // Caller must be authenticated and have sufficient role

    // Get caller's current role from users table
    const callerProfileResponse = await fetch(
      `${supabaseUrl}/rest/v1/users?id=eq.${callerId}&select=role`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
      }
    );

    if (!callerProfileResponse.ok) {
      return errorResponse("Failed to fetch caller profile", 500);
    }

    const callerProfiles = await callerProfileResponse.json();
    if (!Array.isArray(callerProfiles) || callerProfiles.length === 0) {
      return errorResponse("Caller profile not found", 404);
    }

    const callerRole = callerProfiles[0].role as Role;
    const callerLevel = ROLE_LEVELS[callerRole];

    // Only admin+ can promote
    if (callerLevel < ROLE_LEVELS.admin) {
      return errorResponse("Insufficient permissions. Admin role or higher required.", 403);
    }

    // Cannot promote to a level higher than your own
    if (ROLE_LEVELS[targetRole] > callerLevel) {
      return errorResponse(
        `Cannot promote to ${targetRole}. Your role (${callerRole}) is not high enough.`,
        403
      );
    }

    // Cannot promote yourself
    if (callerId === targetUserId) {
      return errorResponse("Cannot change your own role", 403);
    }

    // Get target user's current role
    const targetProfileResponse = await fetch(
      `${supabaseUrl}/rest/v1/users?id=eq.${targetUserId}&select=role,email,display_name`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
      }
    );

    if (!targetProfileResponse.ok) {
      return errorResponse("Failed to fetch target profile", 500);
    }

    const targetProfiles = await targetProfileResponse.json();
    if (!Array.isArray(targetProfiles) || targetProfiles.length === 0) {
      return errorResponse("Target user not found", 404);
    }

    const targetCurrentRole = targetProfiles[0].role as Role;

    // Cannot demote someone at or above your level
    if (ROLE_LEVELS[targetCurrentRole] >= callerLevel) {
      return errorResponse(
        `Cannot change role of ${targetCurrentRole}. They are at or above your level.`,
        403
      );
    }

    // Perform the role update using service role key
    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/users?id=eq.${targetUserId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({ role: targetRole }),
      }
    );

    if (!updateResponse.ok) {
      const err = await updateResponse.json();
      return errorResponse(`Failed to update role: ${JSON.stringify(err)}`, 500);
    }

    return successResponse({
      message: `User role updated from ${targetCurrentRole} to ${targetRole}`,
      userId: targetUserId,
      previousRole: targetCurrentRole,
      newRole: targetRole,
      promotedBy: callerId,
      promoterRole: callerRole,
    });
  } catch (err) {
    return errorResponse(`Internal error: ${err.message}`, 500);
  }
});

function errorResponse(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function successResponse(data: object) {
  return new Response(JSON.stringify({ success: true, ...data }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
