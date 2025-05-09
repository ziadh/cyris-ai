import { NextResponse, NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: { domain: string } }
) {
  const domain = context.params.domain;

  if (!domain) {
    return new NextResponse("Domain parameter is required", { status: 400 });
  }

  const faviconServiceUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  const fourWeeksInSeconds = 2419200;

  try {
    const imageResponse = await fetch(faviconServiceUrl, {
      next: { revalidate: fourWeeksInSeconds },
    });

    if (!imageResponse.ok) {
      return new NextResponse("Failed to fetch favicon from upstream service", {
        status: imageResponse.status,
      });
    }

    const imageBlob = await imageResponse.blob();
    const contentType =
      imageResponse.headers.get("Content-Type") || "image/png";

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set(
      "Cache-Control",
      `public, max-age=${fourWeeksInSeconds}, stale-while-revalidate=${fourWeeksInSeconds}`
    );

    return new NextResponse(imageBlob, { status: 200, headers });
  } catch (error) {
    console.error("Error fetching favicon:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
