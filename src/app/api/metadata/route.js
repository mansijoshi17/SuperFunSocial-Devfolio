import fetch from "node-fetch";
import { parseDocument } from "htmlparser2";
import { NextResponse } from "next/server";
import { DomUtils } from "htmlparser2";

export async function GET(req) {
  const { searchParams } = new URL(req.url, "http://example.com");
  const url = searchParams.get("url");

  if (!url) {
    console.log("No URL provided");
    return NextResponse.json({ error: "URL is required" });
  }

  try {
    const headResponse = await fetch(url, { method: "HEAD" });
    const contentType = headResponse.headers.get("content-type") || "";

    // Check if the URL is a direct link to an image
    if (contentType.startsWith("image/")) {
      return NextResponse.json({
        metaTags: { "og:image": url },
        frameTags: {},
        image: url,
        video: null,
        status: 200,
      });
    }

    // Check if the URL is a direct link to a video
    if (contentType.startsWith("video/")) {
      return NextResponse.json({
        metaTags: { "og:video": url },
        frameTags: {},
        image: null,
        video: url,
        status: 200,
      });
    }

    const isHLS = /\.m3u8$/i.test(url);
    if (isHLS) {
      return NextResponse.json({
        metaTags: { "og:video": url },
        frameTags: {},
        image: null,
        video: url,
        status: 200,
      });
    }

    const response = await fetch(url);

    const htmlString = await response.text();
    const document = parseDocument(htmlString);
    const metaTags = {};
    const frameTags = {};
    const twitterTags = {};

    const metaElements = DomUtils.findAll(
      (elem) => elem.tagName === "meta",
      document.children
    );

    metaElements.forEach((element) => {
      const property = element.attribs["property"] || element.attribs["name"];
      const content = element.attribs["content"];
      if (property && content) {
        if (property.startsWith("twitter:")) {
          twitterTags[property] = content;
        } else {
          metaTags[property] = content;
        }
      }
    });

    const frameImage = metaTags["fc:frame:image"];
    const aspectRatio = metaTags["fc:frame:image:aspect_ratio"];
    const frameVideo = metaTags["fc:frame:video"];
    const frameVideoType = metaTags["fc:frame:video:type"];

    if (frameImage && aspectRatio) {
      frameTags["fc:frame:image"] = frameImage;
      frameTags["fc:frame:image:aspect_ratio"] = aspectRatio;
    }
    if (frameVideo && frameVideoType) {
      frameTags["fc:frame:video"] = frameVideo;
      frameTags["fc:frame:video:type"] = frameVideoType;
    }

    return NextResponse.json({
      metaTags,
      frameTags,
      twitterTags,
      image: null,
      video: null,
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching metadata", error);
    return NextResponse.json({ error: "Failed to fetch metadata" });
  }
}
