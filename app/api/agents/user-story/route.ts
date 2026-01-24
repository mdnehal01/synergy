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

export async function PUT(req: Request) {
  try {
    // 1. Read body
    const { title, description, acceptanceCriteria, assignedTo, workItemType, parentId } = await req.json();

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Default to User Story if no type specified
    const type = workItemType || "User Story";

    // 2. Build JSON Patch document for Azure DevOps
    const patchDocument = [
      {
        op: "add",
        path: "/fields/System.Title",
        value: title,
      },
    ];

    // Add optional fields
    if (description) {
      patchDocument.push({
        op: "add",
        path: "/fields/System.Description",
        value: description,
      });
    }

    if (acceptanceCriteria) {
      patchDocument.push({
        op: "add",
        path: "/fields/Microsoft.VSTS.Common.AcceptanceCriteria",
        value: acceptanceCriteria,
      });
    }

    if (assignedTo) {
      patchDocument.push({
        op: "add",
        path: "/fields/System.AssignedTo",
        value: assignedTo,
      });
    }

    // Add parent link (Epic/Feature)
    if (parentId) {
      patchDocument.push({
        op: "add",
        path: "/relations/-",
        value: {
          rel: "System.LinkTypes.Hierarchy-Reverse",
          url: `https://dev.azure.com/${process.env.AZURE_ORG}/${process.env.AZURE_PROJECT}/_apis/wit/workitems/${parentId}`,
        },
      });
    }

    // 3. Create work item in Azure DevOps
    const createRes = await fetch(
      `https://dev.azure.com/${process.env.AZURE_ORG}/${process.env.AZURE_PROJECT}/_apis/wit/workitems/$${type}?api-version=7.0`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json-patch+json",
          Authorization:
            "Basic " +
            Buffer.from(":" + process.env.AZURE_PAT).toString("base64"),
        },
        body: JSON.stringify(patchDocument),
      }
    );

    if (!createRes.ok) {
      const errorText = await createRes.text();
      console.error("Azure DevOps error:", errorText);
      return NextResponse.json(
        { error: "Failed to create work item", details: errorText },
        { status: 500 }
      );
    }

    const createdWorkItem = await createRes.json();

    // 4. Return formatted response
    return NextResponse.json({
      success: true,
      id: createdWorkItem.id,
      workItemId: `US-${createdWorkItem.id}`,
      title: createdWorkItem.fields["System.Title"],
      state: createdWorkItem.fields["System.State"],
      url: createdWorkItem._links.html.href,
    });
  } catch (error) {
    console.error("Error creating work item:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    // 1. Read body
    const { 
      pullRequestId, 
      sourceBranch, 
      targetBranch, 
      title, 
      description, 
      workItemId,
      operation, // 'create', 'update', 'complete', 'abandon'
      reviewers, // Array of reviewer email addresses
      autoComplete,
      completionOptions
    } = await req.json();

    // 2. Get repository ID
    const repoRes = await fetch(
      `https://dev.azure.com/${process.env.AZURE_ORG}/${process.env.AZURE_PROJECT}/_apis/git/repositories?api-version=7.0`,
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(":" + process.env.AZURE_PAT).toString("base64"),
        },
      }
    );

    if (!repoRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch repositories" },
        { status: 500 }
      );
    }

    const repos = await repoRes.json();
    const repository = repos.value[0]; // Use first repository

    if (!repository) {
      return NextResponse.json(
        { error: "No repository found" },
        { status: 404 }
      );
    }

    // Handle different operations
    if (pullRequestId && (operation === 'update' || operation === 'complete' || operation === 'abandon')) {
      // UPDATE, COMPLETE, or ABANDON existing PR
      const patchDocument: any[] = [];

      if (operation === 'complete') {
        patchDocument.push({
          op: "add",
          path: "/status",
          value: "completed"
        });
        
        if (completionOptions) {
          if (completionOptions.deleteSourceBranch !== undefined) {
            patchDocument.push({
              op: "add",
              path: "/completionOptions/deleteSourceBranch",
              value: completionOptions.deleteSourceBranch
            });
          }
          if (completionOptions.mergeCommitMessage) {
            patchDocument.push({
              op: "add",
              path: "/completionOptions/mergeCommitMessage",
              value: completionOptions.mergeCommitMessage
            });
          }
        }
      } else if (operation === 'abandon') {
        patchDocument.push({
          op: "add",
          path: "/status",
          value: "abandoned"
        });
      } else {
        // Update PR metadata
        if (title) {
          patchDocument.push({
            op: "replace",
            path: "/title",
            value: title
          });
        }
        if (description) {
          patchDocument.push({
            op: "replace",
            path: "/description",
            value: description
          });
        }
      }

      const updateRes = await fetch(
        `https://dev.azure.com/${process.env.AZURE_ORG}/${process.env.AZURE_PROJECT}/_apis/git/repositories/${repository.id}/pullrequests/${pullRequestId}?api-version=7.0`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json-patch+json",
            Authorization:
              "Basic " +
              Buffer.from(":" + process.env.AZURE_PAT).toString("base64"),
          },
          body: JSON.stringify(patchDocument),
        }
      );

      if (!updateRes.ok) {
        const errorText = await updateRes.text();
        console.error("Azure DevOps PR update error:", errorText);
        return NextResponse.json(
          { error: `Failed to ${operation} pull request`, details: errorText },
          { status: 500 }
        );
      }

      const updatedPr = await updateRes.json();

      return NextResponse.json({
        success: true,
        pullRequestId: updatedPr.pullRequestId,
        title: updatedPr.title,
        status: updatedPr.status,
        operation: operation,
        url: `https://dev.azure.com/${process.env.AZURE_ORG}/${process.env.AZURE_PROJECT}/_git/${repository.name}/pullrequest/${updatedPr.pullRequestId}`,
      });
    } else {
      // CREATE new PR
      if (!sourceBranch || !title) {
        return NextResponse.json(
          { error: "sourceBranch and title are required for creating PR" },
          { status: 400 }
        );
      }

      const target = targetBranch || "main";

      // 3. Create Pull Request
      const prPayload: any = {
        sourceRefName: `refs/heads/${sourceBranch}`,
        targetRefName: `refs/heads/${target}`,
        title: title,
        description: description || "",
        workItemRefs: workItemId ? [
          {
            id: workItemId.toString().replace(/US-/i, "")
          }
        ] : [],
      };

      // Add reviewers if provided
      if (reviewers && Array.isArray(reviewers) && reviewers.length > 0) {
        prPayload.reviewers = reviewers.map((email: string) => ({
          id: email,
          isRequired: true
        }));
      }

      // Add auto-complete if specified
      if (autoComplete) {
        prPayload.autoCompleteSetBy = {
          id: process.env.AZURE_USER_ID || ""
        };
      }

      const prRes = await fetch(
        `https://dev.azure.com/${process.env.AZURE_ORG}/${process.env.AZURE_PROJECT}/_apis/git/repositories/${repository.id}/pullrequests?api-version=7.0`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Basic " +
              Buffer.from(":" + process.env.AZURE_PAT).toString("base64"),
          },
          body: JSON.stringify(prPayload),
        }
      );

      if (!prRes.ok) {
        const errorText = await prRes.text();
        console.error("Azure DevOps PR creation error:", errorText);
        return NextResponse.json(
          { error: "Failed to create pull request", details: errorText },
          { status: 500 }
        );
      }

      const pr = await prRes.json();

      // 4. Return formatted response
      return NextResponse.json({
        success: true,
        pullRequestId: pr.pullRequestId,
        title: pr.title,
        sourceBranch: pr.sourceRefName.replace("refs/heads/", ""),
        targetBranch: pr.targetRefName.replace("refs/heads/", ""),
        status: pr.status,
        operation: 'create',
        url: `https://dev.azure.com/${process.env.AZURE_ORG}/${process.env.AZURE_PROJECT}/_git/${repository.name}/pullrequest/${pr.pullRequestId}`,
        createdBy: pr.createdBy.displayName,
      });
    }
  } catch (error) {
    console.error("Error in PR operation:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    // Parse URL to get PR ID from query params
    const { searchParams } = new URL(req.url);
    const pullRequestId = searchParams.get('pullRequestId');

    if (!pullRequestId) {
      return NextResponse.json(
        { error: "pullRequestId is required" },
        { status: 400 }
      );
    }

    // Get repository ID
    const repoRes = await fetch(
      `https://dev.azure.com/${process.env.AZURE_ORG}/${process.env.AZURE_PROJECT}/_apis/git/repositories?api-version=7.0`,
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(":" + process.env.AZURE_PAT).toString("base64"),
        },
      }
    );

    if (!repoRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch repositories" },
        { status: 500 }
      );
    }

    const repos = await repoRes.json();
    const repository = repos.value[0];

    if (!repository) {
      return NextResponse.json(
        { error: "No repository found" },
        { status: 404 }
      );
    }

    // Abandon the PR (Azure DevOps doesn't support DELETE, we PATCH with status=abandoned)
    const patchDocument = [
      {
        op: "add",
        path: "/status",
        value: "abandoned"
      }
    ];

    const abandonRes = await fetch(
      `https://dev.azure.com/${process.env.AZURE_ORG}/${process.env.AZURE_PROJECT}/_apis/git/repositories/${repository.id}/pullrequests/${pullRequestId}?api-version=7.0`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json-patch+json",
          Authorization:
            "Basic " +
            Buffer.from(":" + process.env.AZURE_PAT).toString("base64"),
        },
        body: JSON.stringify(patchDocument),
      }
    );

    if (!abandonRes.ok) {
      const errorText = await abandonRes.text();
      console.error("Azure DevOps PR abandon error:", errorText);
      return NextResponse.json(
        { error: "Failed to abandon pull request", details: errorText },
        { status: 500 }
      );
    }

    const abandonedPr = await abandonRes.json();

    return NextResponse.json({
      success: true,
      pullRequestId: abandonedPr.pullRequestId,
      title: abandonedPr.title,
      status: abandonedPr.status,
      message: "Pull request abandoned successfully",
    });
  } catch (error) {
    console.error("Error abandoning pull request:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
