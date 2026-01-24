import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // 1. Simple security
  // const agentKey = req.headers.get("x-agent-key");
  // if (agentKey !== process.env.AGENT_SECRET) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  // 2. Read body
  const { userStoryId } = await req.json();
  console.log(userStoryId)

  if (!/^US-\d+$/i.test(userStoryId)) {
    return NextResponse.json(
      { error: "Invalid User Story ID" },
      { status: 400 }
    );
  }

  const id = userStoryId.replace("US-", "");

  // 3. Fetch from Azure DevOps
  const adoRes = await fetch(
    `https://dev.azure.com/${process.env.AZURE_ORG}/${process.env.AZURE_PROJECT}/_apis/wit/workitems/${id}?api-version=7.0`,
    {
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(":" + process.env.AZURE_PAT).toString("base64"),
      },
    }
  );

  if (!adoRes.ok) {
    return NextResponse.json(
      { error: "Failed to fetch user story" },
      { status: 500 }
    );
  }

  const adoData = await adoRes.json();

  // 4. Build instructions (VERY IMPORTANT)
  const response = {
    branch: `us-${userStoryId}`,
    commitMessage: `${userStoryId}: ${adoData.fields["System.Title"]}`,
    instructions: [
      `Implement: ${adoData.fields["System.Title"]}`,
      `Acceptance Criteria: ${adoData.fields["System.AcceptanceCriteria"]}`,
      `Update tests if required`,
    ],
    pr: {
      title: `${userStoryId} - ${adoData.fields["System.Title"]}`,
      description: adoData.fields["System.Description"],
    },
  };

  return NextResponse.json(response);
}

function formatDateWithRelative(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

  let dateLabel = dateOnly.getTime() === todayOnly.getTime() 
    ? "Today"
    : dateOnly.getTime() === yesterdayOnly.getTime()
    ? "Yesterday"
    : date.toLocaleDateString();

  const time = date.toLocaleTimeString("en-US", { 
    hour: "2-digit", 
    minute: "2-digit",
    hour12: true 
  });

  return `${dateLabel}, ${time}`;
}

function getWorkItemIcon(workItemType: string): string {
  const type = workItemType.toLowerCase().trim();
  
  if (type === "epic") return "👑";
  if (type === "feature") return "🏆";
  if (type === "bug") return "🐞";
  if (type === "user story") return "📘";
  if (type === "task") return "🗏";
  
  return "📋"; // default icon
}

function formatState(state: string): string {
  const stateNormalized = state.toLowerCase().trim();
  
  if (stateNormalized === "new") return "⚪ New";
  if (stateNormalized === "closed") return "🟢 Closed";
  if (stateNormalized === "blocked") return "🔴 Blocked";
  if (stateNormalized === "rejected") return "🔴 Rejected";
  if (stateNormalized === "ready for test") return "🟡 Ready for Test";
  if (stateNormalized === "in progress") return "🔵 In Progress";
  
  return state; // return original if no match
}

export async function GET(req: Request) {
  const wiqlQuery = {
    query: 'SELECT [System.Id], [System.Title], [System.State], [System.AssignedTo], [System.WorkItemType], [System.CreatedDate], [System.ChangedDate] FROM workitems ORDER BY [System.ChangedDate] DESC'
  };

  const wiqlRes = await fetch(
    `https://dev.azure.com/${process.env.AZURE_ORG}/${process.env.AZURE_PROJECT}/_apis/wit/wiql?api-version=7.0`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(":" + process.env.AZURE_PAT).toString("base64"),
      },
      body: JSON.stringify(wiqlQuery),
    }
  );

  if (!wiqlRes.ok) {
    return NextResponse.json(
      { error: "Failed to fetch work items from Azure DevOps" },
      { status: 500 }
    );
  }

  const wiqlData = await wiqlRes.json();

  // Fetch detailed information for each work item
  const workItems = await Promise.all(
    wiqlData.workItems.map(async (item: any) => {
      const detailRes = await fetch(
        `https://dev.azure.com/${process.env.AZURE_ORG}/${process.env.AZURE_PROJECT}/_apis/wit/workitems/${item.id}?api-version=7.0`,
        {
          headers: {
            Authorization:
              "Basic " +
              Buffer.from(":" + process.env.AZURE_PAT).toString("base64"),
          },
        }
      );

      if (!detailRes.ok) {
        return null;
      }

      const detail = await detailRes.json();
      const workItemType = detail.fields["System.WorkItemType"];
      const icon = getWorkItemIcon(workItemType);
      
      return {
        item: `${icon} ${workItemType} - ${detail.id}`,
        title: detail.fields["System.Title"],
        state: formatState(detail.fields["System.State"]),
        assignedTo: detail.fields["System.AssignedTo"]?.displayName || "Unassigned",
        createdDate: formatDateWithRelative(detail.fields["System.CreatedDate"]),
        changedDate: formatDateWithRelative(detail.fields["System.ChangedDate"]),
        url: detail.url,
      };
    })
  );

  const validWorkItems = workItems.filter((item) => item !== null);

  return NextResponse.json({
    count: validWorkItems.length,
    workItems: validWorkItems,
  });
}
