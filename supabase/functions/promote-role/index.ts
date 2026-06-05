import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const VALID_ROLES = ["owner", "admin", "moderator", "user"] as const;
type Role = (typeof VALID_ROLES)[number];

const ROLE_LEVELS: Record<Role, number> = {
  owner: 4,
  admin: 3,
  moderator: 2,
  user: 1,
};

const supabaseUrl = () => Deno.env.get("SUPABASE_URL")!;
const anonKey = () => Deno.env.get("SUPABASE_ANON_KEY")!;
const serviceKey = () => Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function serviceHeaders() {
  return {
    apikey: anonKey(),
    Authorization: `Bearer ${serviceKey()}`,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return errorResponse("Missing authorization header", 401);
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify JWT token via Supabase Auth
    const userResponse = await fetch(`${supabaseUrl()}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: anonKey(),
      },
    });

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

    if (!targetUserId || !newRole) {
      return errorResponse("Missing targetUserId or newRole");
    }

    if (!VALID_ROLES.includes(newRole as Role)) {
      return errorResponse(
        `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}`
      );
    }

    const targetRole = newRole as Role;

    // === BOOTSTRAP MODE ===
    if (bootstrapSecret) {
      // Read bootstrap secret from system_config table (service role bypasses RLS)
      const configResponse = await fetch(
        `${supabaseUrl()}/rest/v1/system_config?key=eq.bootstrap_secret&select=value`,
        {
          headers: serviceHeaders(),
        }
      );

      if (!configResponse.ok) {
        return errorResponse("Failed to read bootstrap config", 500);
      }

      const configData = await configResponse.json();
      const storedSecret =
        Array.isArray(configData) && configData.length > 0
          ? configData[0].value
          : null;

      if (!storedSecret) {
        return errorResponse(
          "Bootstrap not configured. No bootstrap_secret found in system_config.",
          403
        );
      }

      if (bootstrapSecret !== storedSecret) {
        return errorResponse("Invalid bootstrap secret", 403);
      }

      if (targetRole !== "owner") {
        return errorResponse("Bootstrap can only create the first owner", 403);
      }

      // Check if any owner already exists
      const ownersResponse = await fetch(
        `${supabaseUrl()}/rest/v1/users?role=eq.owner&select=id`,
        {
          headers: serviceHeaders(),
        }
      );

      if (ownersResponse.ok) {
        const owners = await ownersResponse.json();
        if (Array.isArray(owners) && owners.length > 0) {
          return errorResponse(
            "Owner already exists. Use normal promotion flow.",
            403
          );
        }
      }

      // Promote using service role key
      const updateResponse = await fetch(
        `${supabaseUrl()}/rest/v1/users?id=eq.${targetUserId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...serviceHeaders(),
          },
          body: JSON.stringify({ role: "owner" }),
        }
      );

      if (!updateResponse.ok) {
        const err = await updateResponse.json();
        return errorResponse(
          `Failed to promote user: ${JSON.stringify(err)}`,
          500
        );
      }

      // Delete bootstrap secret after successful use (one-time only)
      await fetch(
        `${supabaseUrl()}/rest/v1/system_config?key=eq.bootstrap_secret`,
        {
          method: "DELETE",
          headers: serviceHeaders(),
        }
      );

      return successResponse({
        message: "Bootstrap owner created successfully. Bootstrap secret has been consumed.",
        userId: targetUserId,
        role: "owner",
      });
    }

    // === NORMAL PROMOTION MODE ===
    // Get caller's current role
    const callerProfileResponse = await fetch(
      `${supabaseUrl()}/rest/v1/users?id=eq.${callerId}&select=role`,
      {
        headers: serviceHeaders(),
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

    if (callerLevel < ROLE_LEVELS.admin) {
      return errorResponse(
        "Insufficient permissions. Admin role or higher required.",
        403
      );
    }

    if (ROLE_LEVELS[targetRole] > callerLevel) {
      return errorResponse(
        `Cannot promote to ${targetRole}. Your role (${callerRole}) is not high enough.`,
        403
      );
    }

    if (callerId === targetUserId) {
      return errorResponse("Cannot change your own role", 403);
    }

    // Get target user's current role
    const targetProfileResponse = await fetch(
      `${supabaseUrl()}/rest/v1/users?id=eq.${targetUserId}&select=role`,
      {
        headers: serviceHeaders(),
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

    if (ROLE_LEVELS[targetCurrentRole] >= callerLevel) {
      return errorResponse(
        `Cannot change role of ${targetCurrentRole}. They are at or above your level.`,
        403
      );
    }

    // Perform the role update
    const updateResponse = await fetch(
      `${supabaseUrl()}/rest/v1/users?id=eq.${targetUserId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...serviceHeaders(),
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
